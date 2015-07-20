module.exports = Chain;

function Chain(chainName, maxChainLength)
{
    var chainName = chainName;
    var maxChainLength = maxChainLength;
    var submissions = [];
    // submission objects by convention have the following properties:
    //   - author: string name of author
    //   - content: string of the link or description
    this.addSubmission = function(author, content)
    {
        if(submissions.length === maxChainLength){
            console.log("Chain " + chainName + " is complete!");
            return;
        }
        console.log("Author " + author + " submitted content " + content);
        submissions.push({author : author, content : content});
    };
    this.submissionCount = function(){return submissions.length;};
    this.getLastSubmission = function(){
        if(submissions.length === 0){
            return undefined;
        }
        else{
            return submissions[submissions.length - 1];
        }
    };
    this.isComplete = function(){
        return submissions.length === maxChainLength;
    };
    this.getName = function(){
        return chainName;
    };

    // Returns a ChainInfo object, which by convention has
    // the following properties:
    //   - chainName: string containing the title (with og. owner)
    //   - submissions: array of submission objects, q.v. addSubmission
    this.getChainInfo = function(){
        var chainInfo = {chainName: chainName, submissions: submissions};
        return chainInfo;
    };
}
