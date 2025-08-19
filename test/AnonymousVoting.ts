import { AnonymousVoting, AnonymousVoting__factory } from "../types";
import { FhevmType } from "@fhevm/hardhat-plugin";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, fhevm } from "hardhat";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
  charlie: HardhatEthersSigner;
  diana: HardhatEthersSigner;
};

async function deployVotingFixture() {
  const factory = (await ethers.getContractFactory("AnonymousVoting")) as AnonymousVoting__factory;
  const votingContract = (await factory.deploy()) as AnonymousVoting;
  const votingContractAddress = await votingContract.getAddress();

  return { votingContract, votingContractAddress };
}

describe("AnonymousVoting", function () {
  let signers: Signers;
  let votingContract: AnonymousVoting;
  let votingContractAddress: string;

  const VOTING_DURATION = 3600; // seconds
  const VOTING_TITLE = "President Election 2024";
  const VOTING_DESCRIPTION = "Choose the next president";
  const CANDIDATES = ["Alice Smith", "Bob Johnson", "Charlie Brown"];

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = {
      deployer: ethSigners[0],
      alice: ethSigners[1],
      bob: ethSigners[2],
      charlie: ethSigners[3],
      diana: ethSigners[4],
    };
  });

  beforeEach(async () => {
    ({ votingContract, votingContractAddress } = await deployVotingFixture());
  });

  describe("Deployment", function () {
    it("should be deployed successfully", async function () {
      console.log(`AnonymousVoting has been deployed at address ${votingContractAddress}`);
      expect(ethers.isAddress(votingContractAddress)).to.eq(true);
    });

    it("should initialize with zero votings", async function () {
      const totalVotings = await votingContract.getTotalVotings();
      expect(totalVotings).to.eq(0);
    });
  });

  describe("Creating Voting Sessions", function () {
    it("should create a voting session successfully", async function () {
      const tx = await votingContract
        .connect(signers.deployer)
        .createVoting(VOTING_TITLE, VOTING_DESCRIPTION, CANDIDATES, VOTING_DURATION);

      await tx.wait();

      const totalVotings = await votingContract.getTotalVotings();
      expect(totalVotings).to.eq(1);

      const votingInfo = await votingContract.getVotingInfo(0);
      expect(votingInfo.title).to.eq(VOTING_TITLE);
      expect(votingInfo.description).to.eq(VOTING_DESCRIPTION);
      expect(votingInfo.creator).to.eq(signers.deployer.address);
      expect(votingInfo.candidateCount).to.eq(CANDIDATES.length);
      expect(votingInfo.ended).to.eq(false);
      expect(votingInfo.totalVoters).to.eq(0);
    });

    it("should fail with less than 2 candidates", async function () {
      await expect(
        votingContract
          .connect(signers.deployer)
          .createVoting(VOTING_TITLE, VOTING_DESCRIPTION, ["Only One"], VOTING_DURATION),
      ).to.be.revertedWith("At least 2 candidates required");
    });

    it("should fail with more than 10 candidates", async function () {
      const tooManyCandidates = Array.from({ length: 11 }, (_, i) => `Candidate ${i + 1}`);
      await expect(
        votingContract
          .connect(signers.deployer)
          .createVoting(VOTING_TITLE, VOTING_DESCRIPTION, tooManyCandidates, VOTING_DURATION),
      ).to.be.revertedWith("Maximum 10 candidates allowed");
    });

    it("should retrieve candidate information correctly", async function () {
      await votingContract
        .connect(signers.deployer)
        .createVoting(VOTING_TITLE, VOTING_DESCRIPTION, CANDIDATES, VOTING_DURATION);

      for (let i = 0; i < CANDIDATES.length; i++) {
        const candidateName = await votingContract.getCandidateInfo(0, i);
        expect(candidateName).to.eq(CANDIDATES[i]);
      }
    });
  });

  describe("Voting Process", function () {
    beforeEach(async function () {
      // Create a voting session before each test
      await votingContract
        .connect(signers.deployer)
        .createVoting(VOTING_TITLE, VOTING_DESCRIPTION, CANDIDATES, VOTING_DURATION);
    });

    it("should allow casting a vote", async function () {
      const votingId = 0;
      const candidateIndex = 0; // Vote for first candidate
      const voteValue = 1; // Valid vote

      // Check voting is active
      const isActive = await votingContract.isVotingActive(votingId);
      expect(isActive).to.eq(true);

      // Check user hasn't voted yet
      const hasVotedBefore = await votingContract.hasVoted(votingId, signers.alice.address);
      expect(hasVotedBefore).to.eq(false);

      // Create encrypted vote
      const encryptedVote = await fhevm
        .createEncryptedInput(votingContractAddress, signers.alice.address)
        .add32(voteValue)
        .encrypt();

      // Cast vote
      const tx = await votingContract
        .connect(signers.alice)
        .vote(votingId, candidateIndex, encryptedVote.handles[0], encryptedVote.inputProof);

      await tx.wait();

      // Check that user has voted
      const hasVotedAfter = await votingContract.hasVoted(votingId, signers.alice.address);
      expect(hasVotedAfter).to.eq(true);

      // Check total voters increased
      const votingInfo = await votingContract.getVotingInfo(votingId);
      expect(votingInfo.totalVoters).to.eq(1);
    });

    it("should prevent double voting", async function () {
      const votingId = 0;
      const candidateIndex = 0;
      const voteValue = 1;

      // Create encrypted vote
      const encryptedVote = await fhevm
        .createEncryptedInput(votingContractAddress, signers.alice.address)
        .add32(voteValue)
        .encrypt();

      // Cast first vote
      await votingContract
        .connect(signers.alice)
        .vote(votingId, candidateIndex, encryptedVote.handles[0], encryptedVote.inputProof);

      // Try to vote again - should fail
      const encryptedVote2 = await fhevm
        .createEncryptedInput(votingContractAddress, signers.alice.address)
        .add32(voteValue)
        .encrypt();

      await expect(
        votingContract
          .connect(signers.alice)
          .vote(votingId, candidateIndex, encryptedVote2.handles[0], encryptedVote2.inputProof),
      ).to.be.revertedWith("Address has already voted");
    });

    it("should fail when voting for invalid candidate", async function () {
      const votingId = 0;
      const invalidCandidateIndex = 99; // Invalid index
      const voteValue = 1;

      const encryptedVote = await fhevm
        .createEncryptedInput(votingContractAddress, signers.alice.address)
        .add32(voteValue)
        .encrypt();

      await expect(
        votingContract
          .connect(signers.alice)
          .vote(votingId, invalidCandidateIndex, encryptedVote.handles[0], encryptedVote.inputProof),
      ).to.be.revertedWith("Invalid candidate index");
    });

    it("should allow multiple users to vote for different candidates", async function () {
      const votingId = 0;
      const voteValue = 1;

      // Alice votes for candidate 0
      const aliceVote = await fhevm
        .createEncryptedInput(votingContractAddress, signers.alice.address)
        .add32(voteValue)
        .encrypt();

      await votingContract.connect(signers.alice).vote(votingId, 0, aliceVote.handles[0], aliceVote.inputProof);

      // Bob votes for candidate 1
      const bobVote = await fhevm
        .createEncryptedInput(votingContractAddress, signers.bob.address)
        .add32(voteValue)
        .encrypt();

      await votingContract.connect(signers.bob).vote(votingId, 1, bobVote.handles[0], bobVote.inputProof);

      // Charlie votes for candidate 0
      const charlieVote = await fhevm
        .createEncryptedInput(votingContractAddress, signers.charlie.address)
        .add32(voteValue)
        .encrypt();

      await votingContract.connect(signers.charlie).vote(votingId, 0, charlieVote.handles[0], charlieVote.inputProof);

      // Check all users have voted
      expect(await votingContract.hasVoted(votingId, signers.alice.address)).to.eq(true);
      expect(await votingContract.hasVoted(votingId, signers.bob.address)).to.eq(true);
      expect(await votingContract.hasVoted(votingId, signers.charlie.address)).to.eq(true);

      // Check total voters
      const votingInfo = await votingContract.getVotingInfo(votingId);
      expect(votingInfo.totalVoters).to.eq(3);
    });
  });

  describe("Voting Management", function () {
    beforeEach(async function () {
      await votingContract
        .connect(signers.deployer)
        .createVoting(VOTING_TITLE, VOTING_DESCRIPTION, CANDIDATES, VOTING_DURATION);
    });

    it("should allow creator to end voting manually", async function () {
      const votingId = 0;

      // Verify voting is initially active
      expect(await votingContract.isVotingActive(votingId)).to.eq(true);

      // End voting
      const tx = await votingContract.connect(signers.deployer).endVoting(votingId);
      await tx.wait();

      // Verify voting is no longer active
      expect(await votingContract.isVotingActive(votingId)).to.eq(false);

      // Check voting info reflects the change
      const votingInfo = await votingContract.getVotingInfo(votingId);
      expect(votingInfo.ended).to.eq(true);
    });

    it("should prevent non-creator from ending voting", async function () {
      const votingId = 0;

      await expect(votingContract.connect(signers.alice).endVoting(votingId)).to.be.revertedWith(
        "Only voting creator can perform this action",
      );
    });

    it("should prevent voting after manual end", async function () {
      const votingId = 0;
      const voteValue = 1;

      // End voting
      await votingContract.connect(signers.deployer).endVoting(votingId);

      // Try to vote - should fail
      const encryptedVote = await fhevm
        .createEncryptedInput(votingContractAddress, signers.alice.address)
        .add32(voteValue)
        .encrypt();

      await expect(
        votingContract.connect(signers.alice).vote(votingId, 0, encryptedVote.handles[0], encryptedVote.inputProof),
      ).to.be.revertedWith("Voting has been manually ended");
    });
  });

  describe("Results Access", function () {
    beforeEach(async function () {
      await votingContract
        .connect(signers.deployer)
        .createVoting(VOTING_TITLE, VOTING_DESCRIPTION, CANDIDATES, VOTING_DURATION);
    });

    it("should prevent accessing results before voting ends", async function () {
      const votingId = 0;

      await expect(votingContract.getCandidateVoteCount(votingId, 0)).to.be.revertedWith("Voting is still active");
    });

    it("should allow accessing encrypted results after voting ends", async function () {
      const votingId = 0;
      const voteValue = 1;

      // Cast some votes
      const aliceVote = await fhevm
        .createEncryptedInput(votingContractAddress, signers.alice.address)
        .add32(voteValue)
        .encrypt();

      await votingContract.connect(signers.alice).vote(votingId, 0, aliceVote.handles[0], aliceVote.inputProof);

      // End voting manually
      await votingContract.connect(signers.deployer).endVoting(votingId);

      // Should be able to access encrypted vote counts
      const encryptedCount = await votingContract.getCandidateVoteCount(votingId, 0);
      expect(encryptedCount).to.not.eq(ethers.ZeroHash);
    });
  });

  describe("Error Handling", function () {
    it("should fail operations on non-existent voting", async function () {
      const nonExistentVotingId = 999;

      await expect(votingContract.getVotingInfo(nonExistentVotingId)).to.be.revertedWith("Voting does not exist");

      await expect(votingContract.isVotingActive(nonExistentVotingId)).to.be.revertedWith("Voting does not exist");

      await expect(votingContract.hasVoted(nonExistentVotingId, signers.alice.address)).to.be.revertedWith(
        "Voting does not exist",
      );
    });
  });
});
