module.exports = Chain;

function Chain(chainName, maxChainLength)
{
    var chainName = chainName;
    var maxChainLength = maxChainLength;
    var submissions = [];
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
}
