// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract VotingSystem {
    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    struct Voter {
        bool hasVoted;
        uint256 candidateId;
        string NIK;
    }

    address public owner;
    uint256 public candidateCount;
    uint256 public voterCount;
    uint public votesCount;
    mapping(uint256 => Candidate) public candidates;
    mapping(address => Voter) private voters;
    mapping(string => bool) private registeredNIKs;
    mapping(string => bool) private usedNIKs;
    string[] public NIKs;

    bool public votingStarted;
    uint public startVotingTime;
    uint public endVotingTime;
    
    event VotingStarted(uint startTime);
    event VotingEnded(uint endTime);
    event Voted(address voter, uint256 candidateId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier notOwner() {
        require(msg.sender != owner, "Owner cannot vote");
        _;
    }

    modifier hasNotVoted() {
        require(!voters[msg.sender].hasVoted, "You have already voted");
        _;
    }

    modifier validNIK(string memory _NIK) {
        require(registeredNIKs[_NIK], "NIK is not registered");
        _;
    }
    modifier isNIKExist(string memory _NIK){
        require(!registeredNIKs[_NIK], "NIK is registered");
        _;
    }

    modifier hasUsedNIK(string memory _NIK) {
        require(!usedNIKs[_NIK],
            "NIK has already been used to vote"
        );
        _;
    }
    modifier validCandidate(uint256 _candidateId){
        require(_candidateId > 0, "Candidate ID must be greater than zero");
        require(
            candidates[_candidateId].id == 0,
            "Candidate with this ID already exists"
        );
        _;
    }
    modifier isCandidateExist(uint256 _candidateId){
        require(
            candidates[_candidateId].id != 0,
            "Candidate with this ID is not exists"
        );
        _;
    }

    modifier checkEndVoting() {
        if (votingStarted && block.timestamp > endVotingTime) {
            votingStarted = false;
            emit VotingEnded(block.timestamp);
        }
        _;
    }
    modifier onlyBeforeVotingStart(){
        require(!votingStarted || block.timestamp < startVotingTime, "Voting has already started");
        _;
    }

    modifier onlyDuringVoting() {
        require(votingStarted && block.timestamp >= startVotingTime && block.timestamp <= endVotingTime, "Voting is not active");
        _;
    }

    modifier onlyAfterVotingEnd() {
        require(votingStarted && block.timestamp > endVotingTime, "Voting has not ended yet");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function startVoting(uint256 _duration) public onlyOwner onlyBeforeVotingStart {
        require(_duration > 0, "Duration must be greater than zero");
        votingStarted = true;
        startVotingTime = block.timestamp;
        endVotingTime = block.timestamp + _duration;
        emit VotingStarted(startVotingTime);
    }

    function endVoting() public onlyOwner onlyDuringVoting {
        votingStarted = false;
        emit VotingEnded(block.timestamp);
    }

    function addCandidate(string memory _name, uint256 _candidateId)
        public
        onlyOwner
        onlyBeforeVotingStart
        validCandidate(_candidateId)
    {
        candidates[_candidateId] = Candidate(_candidateId, _name, 0);
        candidateCount++;
    }

    function checkIfNIKNotRegistered(string memory _NIK )public isNIKExist(_NIK){
        
    }
    function checkIfNIKRegistered(string memory _NIK )public validNIK(_NIK){
        
    }
    function checkIfNIKHasUsed(string memory _NIK) public hasUsedNIK(_NIK){
        
    }
    
    function checkIfCandidateValid(uint256 _candidateId)public isCandidateExist(_candidateId){
        
    }

    function addNIK(string memory _NIK) public onlyOwner onlyBeforeVotingStart {
        require(bytes(_NIK).length > 0, "NIK is required");
        require(!registeredNIKs[_NIK], "NIK is already registered");
        registeredNIKs[_NIK] = true;
        NIKs.push(_NIK);
        voterCount++;
    }

    function removeNIK(string memory _NIK) public onlyOwner onlyBeforeVotingStart hasUsedNIK(_NIK) validNIK(_NIK) {
        registeredNIKs[_NIK] = false;

        for (uint256 i = 0; i < NIKs.length; i++) {
            if (keccak256(abi.encodePacked(NIKs[i])) == keccak256(abi.encodePacked(_NIK))) {
                NIKs[i] = NIKs[NIKs.length - 1];
                NIKs.pop();
                voterCount--;
                break;
            }
        }
    }

    function vote(uint256 _candidateId, string memory _NIK)
        public
        notOwner
        checkEndVoting
        onlyDuringVoting
        hasNotVoted
        validNIK(_NIK)
        hasUsedNIK(_NIK)
    {
        require(
            _candidateId > 0 && _candidateId <= candidateCount,
            "Invalid candidate ID"
        );

        voters[msg.sender] = Voter({
            hasVoted: true,
            candidateId: _candidateId,
            NIK: _NIK
        });

        candidates[_candidateId].voteCount++;
        usedNIKs[_NIK] = true;
        votesCount++;
        emit Voted(msg.sender, _candidateId);
    }

    function getCandidate(uint256 _candidateId)
        public
        view
        returns (
            uint256,
            string memory,
            uint256
        )
    {
        require(
            _candidateId > 0,
            "Invalid candidate ID"
        );
        Candidate memory candidate = candidates[_candidateId];
        return (candidate.id, candidate.name, candidate.voteCount);
    }

    function getAllCandidates() public view returns (Candidate[] memory) {
        Candidate[] memory candidateList = new Candidate[](candidateCount);
        for (uint256 i = 1; i <= candidateCount; i++) {
            candidateList[i - 1] = candidates[i];
        }
        return candidateList;
    }

    function getVoter()
        public
        view
        returns (
            bool,
            uint256,
            string memory
        ) 
    {
        Voter memory voter = voters[msg.sender];
        return (voter.hasVoted, voter.candidateId, voter.NIK);
    }

    function getAllNIKs() public view returns (string[] memory) {
        return NIKs;
    }

    function getVoterCount() public view returns (uint256) {
        return voterCount;
    }

    function getVotesCount() public view returns (uint256){
        return votesCount;
    }

    function getVotingStatus() public view returns (bool, uint, uint){
        return (votingStarted, startVotingTime, endVotingTime);
    }
    
    function checkIsVotingEnd() public {
        if (votingStarted && block.timestamp > endVotingTime) {
            votingStarted = false;
            emit VotingEnded(block.timestamp);
        }
    }
    
}