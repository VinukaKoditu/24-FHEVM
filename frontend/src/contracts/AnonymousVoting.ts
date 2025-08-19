// 從編譯後的合約中複製ABI
export const AnonymousVoting = {
  abi: [
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "votingId",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "voter",
          type: "address",
        },
      ],
      name: "VoteCast",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "votingId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "string",
          name: "title",
          type: "string",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "startTime",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "endTime",
          type: "uint256",
        },
      ],
      name: "VotingCreated",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "votingId",
          type: "uint256",
        },
      ],
      name: "VotingEnded",
      type: "event",
    },
    {
      inputs: [
        {
          internalType: "string",
          name: "_title",
          type: "string",
        },
        {
          internalType: "string",
          name: "_description",
          type: "string",
        },
        {
          internalType: "string[]",
          name: "_candidateNames",
          type: "string[]",
        },
        {
          internalType: "uint256",
          name: "_duration",
          type: "uint256",
        },
      ],
      name: "createVoting",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_votingId",
          type: "uint256",
        },
      ],
      name: "endVoting",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_votingId",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_candidateIndex",
          type: "uint256",
        },
      ],
      name: "getCandidateInfo",
      outputs: [
        {
          internalType: "string",
          name: "name",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_votingId",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_candidateIndex",
          type: "uint256",
        },
      ],
      name: "getCandidateVoteCount",
      outputs: [
        {
          internalType: "euint32",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getTotalVotings",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_votingId",
          type: "uint256",
        },
      ],
      name: "getVotingInfo",
      outputs: [
        {
          internalType: "string",
          name: "title",
          type: "string",
        },
        {
          internalType: "string",
          name: "description",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "startTime",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "endTime",
          type: "uint256",
        },
        {
          internalType: "bool",
          name: "ended",
          type: "bool",
        },
        {
          internalType: "address",
          name: "creator",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "totalVoters",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "candidateCount",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_votingId",
          type: "uint256",
        },
        {
          internalType: "address",
          name: "_voter",
          type: "address",
        },
      ],
      name: "hasVoted",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_votingId",
          type: "uint256",
        },
      ],
      name: "isVotingActive",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_votingId",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "_candidateIndex",
          type: "uint256",
        },
        {
          internalType: "bytes32",
          name: "inputEuint32",
          type: "bytes32",
        },
        {
          internalType: "bytes",
          name: "inputProof",
          type: "bytes",
        },
      ],
      name: "vote",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "votingCounter",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ],
};
