// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Anonymous Voting Contract using FHEVM
/// @notice A decentralized voting system that preserves voter privacy using Fully Homomorphic Encryption
contract AnonymousVoting is SepoliaConfig {
    // Events
    event VotingCreated(uint256 indexed votingId, string title, uint256 startTime, uint256 endTime);
    event VoteCast(uint256 indexed votingId, address indexed voter);
    event VotingEnded(uint256 indexed votingId);

    // Structs
    struct Candidate {
        string name;
        euint32 encryptedVoteCount; // Encrypted vote count
    }

    struct Voting {
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        Candidate[] candidates;
        mapping(address => bool) hasVoted;
        bool ended;
        address creator;
        uint256 totalVoters;
    }

    // State variables
    uint256 public votingCounter;
    mapping(uint256 votingId => Voting) public votings;

    // Modifiers
    modifier onlyDuringVotingPeriod(uint256 _votingId) {
        require(block.timestamp >= votings[_votingId].startTime, "Voting has not started yet");
        require(block.timestamp <= votings[_votingId].endTime, "Voting has ended");
        require(!votings[_votingId].ended, "Voting has been manually ended");
        _;
    }

    modifier onlyAfterVotingEnded(uint256 _votingId) {
        require(block.timestamp > votings[_votingId].endTime || votings[_votingId].ended, "Voting is still active");
        _;
    }

    modifier onlyVotingCreator(uint256 _votingId) {
        require(msg.sender == votings[_votingId].creator, "Only voting creator can perform this action");
        _;
    }

    modifier votingExists(uint256 _votingId) {
        require(_votingId < votingCounter, "Voting does not exist");
        _;
    }

    /// @notice Creates a new voting session
    /// @param _title The title of the voting
    /// @param _description The description of the voting
    /// @param _candidateNames Array of candidate names
    /// @param _duration Duration of voting in seconds
    function createVoting(
        string memory _title,
        string memory _description,
        string[] memory _candidateNames,
        uint256 _duration
    ) external {
        require(_candidateNames.length >= 2, "At least 2 candidates required");
        require(_candidateNames.length <= 10, "Maximum 10 candidates allowed");
        require(_duration > 0, "Duration must be greater than 0");

        uint256 votingId = votingCounter++;
        Voting storage newVoting = votings[votingId];

        newVoting.title = _title;
        newVoting.description = _description;
        newVoting.startTime = block.timestamp;
        newVoting.endTime = block.timestamp + _duration;
        newVoting.creator = msg.sender;
        newVoting.ended = false;
        newVoting.totalVoters = 0;

        // Initialize candidates with encrypted zero vote counts
        for (uint256 i = 0; i < _candidateNames.length; i++) {
            euint32 encryptedZero = FHE.asEuint32(0);
            newVoting.candidates.push(Candidate({name: _candidateNames[i], encryptedVoteCount: encryptedZero}));

            // Allow this contract to access the encrypted vote count
            FHE.allowThis(encryptedZero);
        }

        emit VotingCreated(votingId, _title, newVoting.startTime, newVoting.endTime);
    }

    /// @notice Cast an encrypted vote for a specific candidate
    /// @param _votingId The ID of the voting session
    /// @param _candidateIndex The index of the candidate to vote for
    /// @param inputEuint32 External encrypted input (should be 1 for valid vote)
    /// @param inputProof Proof for the encrypted input
    function vote(
        uint256 _votingId,
        uint256 _candidateIndex,
        externalEuint32 inputEuint32,
        bytes calldata inputProof
    ) external votingExists(_votingId) onlyDuringVotingPeriod(_votingId) {
        Voting storage voting = votings[_votingId];

        require(!voting.hasVoted[msg.sender], "Address has already voted");
        require(_candidateIndex < voting.candidates.length, "Invalid candidate index");

        // Convert external encrypted input to internal encrypted value
        euint32 encryptedVote = FHE.fromExternal(inputEuint32, inputProof);

        // Add the encrypted vote to the candidate's total
        voting.candidates[_candidateIndex].encryptedVoteCount = FHE.add(
            voting.candidates[_candidateIndex].encryptedVoteCount,
            encryptedVote
        );

        // Allow this contract and the voting creator to access the updated count
        FHE.allowThis(voting.candidates[_candidateIndex].encryptedVoteCount);
        FHE.allow(voting.candidates[_candidateIndex].encryptedVoteCount, voting.creator);

        // Mark that this address has voted
        voting.hasVoted[msg.sender] = true;
        voting.totalVoters++;

        emit VoteCast(_votingId, msg.sender);
    }

    /// @notice Manually end a voting session (only by creator)
    /// @param _votingId The ID of the voting session
    function endVoting(uint256 _votingId) external votingExists(_votingId) onlyVotingCreator(_votingId) {
        require(!votings[_votingId].ended, "Voting already ended");
        votings[_votingId].ended = true;

        emit VotingEnded(_votingId);
    }

    /// @notice Get encrypted vote count for a specific candidate
    /// @param _votingId The ID of the voting session
    /// @param _candidateIndex The index of the candidate
    /// @return The encrypted vote count
    function getCandidateVoteCount(
        uint256 _votingId,
        uint256 _candidateIndex
    ) external view votingExists(_votingId) onlyAfterVotingEnded(_votingId) returns (euint32) {
        require(_candidateIndex < votings[_votingId].candidates.length, "Invalid candidate index");
        return votings[_votingId].candidates[_candidateIndex].encryptedVoteCount;
    }

    /// @notice Get voting information
    /// @param _votingId The ID of the voting session
    function getVotingInfo(
        uint256 _votingId
    )
        external
        view
        votingExists(_votingId)
        returns (
            string memory title,
            string memory description,
            uint256 startTime,
            uint256 endTime,
            bool ended,
            address creator,
            uint256 totalVoters,
            uint256 candidateCount
        )
    {
        Voting storage voting = votings[_votingId];
        return (
            voting.title,
            voting.description,
            voting.startTime,
            voting.endTime,
            voting.ended,
            voting.creator,
            voting.totalVoters,
            voting.candidates.length
        );
    }

    /// @notice Get candidate information
    /// @param _votingId The ID of the voting session
    /// @param _candidateIndex The index of the candidate
    function getCandidateInfo(
        uint256 _votingId,
        uint256 _candidateIndex
    ) external view votingExists(_votingId) returns (string memory name) {
        require(_candidateIndex < votings[_votingId].candidates.length, "Invalid candidate index");
        return votings[_votingId].candidates[_candidateIndex].name;
    }

    /// @notice Check if an address has voted in a specific voting session
    /// @param _votingId The ID of the voting session
    /// @param _voter The address to check
    function hasVoted(uint256 _votingId, address _voter) external view votingExists(_votingId) returns (bool) {
        return votings[_votingId].hasVoted[_voter];
    }

    /// @notice Get the total number of voting sessions
    function getTotalVotings() external view returns (uint256) {
        return votingCounter;
    }

    /// @notice Check if voting is currently active
    /// @param _votingId The ID of the voting session
    function isVotingActive(uint256 _votingId) external view votingExists(_votingId) returns (bool) {
        Voting storage voting = votings[_votingId];
        return block.timestamp >= voting.startTime && block.timestamp <= voting.endTime && !voting.ended;
    }
}
