module.exports = Chain;

function Chain(chainName, maxChainLength)
{
    var chainName = chainName;
    var maxChainLength = maxChainLength;
    var submissions = [];
    this.addSubmission = function(author, content)
    {
        console.log("Author " + author + " submitted content " + content);
        submissions.push({author : author, content : content});
        if(submissions.length === maxChainLength){
            console.log("Chain " + chainName + " is complete!");
        }
    };
}
