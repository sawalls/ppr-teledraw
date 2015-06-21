module.exports = Mailbox;

function Mailbox(mailboxName)
{
    var mailboxName = mailboxName;
    var mailQueue = [];
    this.isEmpty = function(){return mailQueue.length === 0;};
    this.addItem = function(item)
    {
        mailQueue.push(item);
    };
    this.getFrontItem = function()
    {
        if(mailQueue.length === 0){
            console.log("Tried to get the front item from an empty mailbox " + mailboxName);
            return undefined;
        }
    }
    this.popFrontItem = function()
    {
        if(mailQueue.length === 0){
            console.log("Tried to remove front item from empty mailbox " + mailboxName);
            return undefined;
        }
        var frontElt = mailQueue.splice(0,1)[0];
        return frontElt;
    }
    this.getName = function(){return mailboxName;};
}
