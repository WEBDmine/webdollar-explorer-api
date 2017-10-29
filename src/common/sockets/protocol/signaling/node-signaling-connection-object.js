NodeSignalingConnectionObject.ConnectionStatus = {

    initiatorSignalGenerating: 0,
    initiatorSignalGenerated : 1,

    answerSignalGenerating: 2,
    answerSignalGenerated: 3,

    peerConnectionEstablishing: 4,
    peerConnectionEstablished : 5,
};

class NodeSignalingConnectionObject {

    /*
        webPeer1 - initiator
        webPeer2 -
     */

    constructor(webPeer1, webPeer2, status){

        this.webPeer1 = webPeer1;
        this.webPeer2 = webPeer2;
        this.status = status;

        this.established = false;
        this.connectingNow = false;

        this.lastTimeChecked = 0;
        this.lastTimeConnected = 0;
    }

    refreshLastTimeChecked(){
        this.lastTimeChecked = new Date().getTime();
    }

    refreshLastTimeConnected(){
        this.lastTimeConnected = new Date().getTime();
    }

    checkLastTimeChecked(nodeTryReconnectAgain){

        let time = new Date().getTime();

        if ( (time - this.lastTimeChecked) >= ( nodeTryReconnectAgain + this.errorTrials*1000 ))
            return true;

        return false;
    }

}

exports.NodeSignalingConnectionObject = NodeSignalingConnectionObject;
exports.NodeSignalingConnectionObject.ConnectionStatus = NodeSignalingConnectionObject.ConnectionStatus;