const VotingSystem = artifacts.require("VotingSystem.sol");

contract("VotingSystem", (accounts) => {
  let votingInstance;
  const owner = accounts[0];
  const voter1 = accounts[1];
  const voter2 = accounts[2];
  const candidateName1 = "Candidate 1";
  const candidateName2 = "Candidate 2";
  const NIK1 = "1234567890123456";
  const NIK2 = "0987654321098765";

  beforeEach(async () => {
    votingInstance = await VotingSystem.new({ from: owner });
  });

  it("should initialize with correct owner", async () => {
    const contractOwner = await votingInstance.owner();
    assert.equal(contractOwner, owner, "Owner is not set correctly");
  });

  it("should allow owner to add candidates", async () => {
    await votingInstance.addCandidate(candidateName1, { from: owner });
    await votingInstance.addCandidate(candidateName2, { from: owner });

    const candidate1 = await votingInstance.candidates(1);
    const candidate2 = await votingInstance.candidates(2);

    assert.equal(
      candidate1.name,
      candidateName1,
      "Candidate 1 name is incorrect"
    );
    assert.equal(
      candidate2.name,
      candidateName2,
      "Candidate 2 name is incorrect"
    );
  });

  it("should not allow non-owner to add candidates", async () => {
    try {
      await votingInstance.addCandidate(candidateName1, { from: voter1 });
      assert.fail("Non-owner was able to add a candidate");
    } catch (error) {
      assert(
        error.message.indexOf("Only owner can call this function") >= 0,
        "Error message not as expected"
      );
    }
  });

  it("should allow a voter to vote", async () => {
    await votingInstance.addCandidate(candidateName1, { from: owner });
    await votingInstance.vote(1, NIK1, { from: voter1 });

    const voter = await votingInstance.voters(voter1);
    assert.equal(voter.hasVoted, true, "Voter has not voted");
    assert.equal(
      voter.candidateId,
      1,
      "Voter did not vote for the correct candidate"
    );
    assert.equal(voter.NIK, NIK1, "Voter NIK is incorrect");

    const candidate = await votingInstance.candidates(1);
    assert.equal(candidate.voteCount, 1, "Candidate vote count is incorrect");
  });

  it("should not allow a voter to vote more than once", async () => {
    await votingInstance.addCandidate(candidateName1, { from: owner });
    await votingInstance.vote(1, NIK1, { from: voter1 });

    try {
      await votingInstance.vote(1, NIK1, { from: voter1 });
      assert.fail("Voter was able to vote more than once");
    } catch (error) {
      assert(
        error.message.indexOf("You have already voted") >= 0,
        "Error message not as expected"
      );
    }
  });

  it("should not allow a voter to vote with an NIK already used by another address", async () => {
    await votingInstance.addCandidate(candidateName1, { from: owner });
    await votingInstance.vote(1, NIK1, { from: voter1 });

    try {
      await votingInstance.vote(1, NIK1, { from: voter2 });
      assert.fail(
        "Voter was able to vote with an NIK already used by another address"
      );
    } catch (error) {
      assert(
        error.message.indexOf("NIK is already registered to another address") >=
          0,
        "Error message not as expected"
      );
    }
  });

  it("should return correct candidate details", async () => {
    await votingInstance.addCandidate(candidateName1, { from: owner });
    const candidate = await votingInstance.getCandidate(1);
    assert.equal(candidate[0], 1, "Candidate ID is incorrect");
    assert.equal(candidate[1], candidateName1, "Candidate name is incorrect");
    assert.equal(candidate[2], 0, "Candidate vote count is incorrect");
  });

  it("should return correct voter details", async () => {
    await votingInstance.addCandidate(candidateName1, { from: owner });
    await votingInstance.vote(1, NIK1, { from: voter1 });

    const voter = await votingInstance.getVoter(voter1);
    assert.equal(voter[0], true, "Voter hasVoted is incorrect");
    assert.equal(voter[1], 1, "Voter candidateId is incorrect");
    assert.equal(voter[2], NIK1, "Voter NIK is incorrect");
  });
});
