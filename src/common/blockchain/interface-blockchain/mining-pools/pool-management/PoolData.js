import InterfaceSatoshminDB from 'common/satoshmindb/Interface-SatoshminDB';
const BigNumber = require('bignumber.js');
import Serialization from "common/utils/Serialization";
import BufferExtended from 'common/utils/BufferExtended';

class PoolData {

    constructor(dataBase) {

        if (dataBase === undefined)
            this.db = new InterfaceSatoshminDB("poolDB");
        else
            this.db = dataBase;

        this._minersList = [];

    }
    
    /**
     * @param minerAddress
     * @returns miner or null if it doesn't exist
     */
    getMiner(minerAddress){
        
        for (let i = 0; i < this._minersList.length; ++i) 
            if (this._minersList[i].address === minerAddress)
                return {index: i, miner: this._minersList[i]};
                
        return null;
    }
    
    /**
     * Insert a new miner if not exists. Synchronizes with DB.
     * @param minerAddress
     * @param minerReward
     * @returns true/false
     */
    async setMiner(minerAddress, minerReward = new BigNumber(0)){
        
        if (this.getMiner(minerAddress) === null) {
            this._minersList.push( {address: minerAddress, reward: minerReward} );
            return (await this.saveMinersList());
        }
        
        return false; //miner already exists
    }
    
    /**
     * Remove a miner if exists. Synchronizes with DB.
     * @param minerAddress
     * @returns true/false 
     */
    async removeMiner(minerAddress){

        let response = this.getMiner(minerAddress);

        if (response === null)
            return false; //miner doesn't exists
        
        let index = response.index;
        
        this._minersList[index] = this._minersList[this._minersList.length - 1];
        this._minersList.pop();
        
        return (await this.saveMinersList());
    }
    
    getMinersList() {
        return this._minersList;
    }
    
    setMinersList(rewardList) {
        this._minersList = rewardList;
    }
    
    /**
     * Set new reward for miner if it exists
     * @param minerAddress
     * @returns miner reward or 0 if it doesn't exist
     */
    getMinerReward(minerAddress) {

        let response = this.getMiner(minerAddress);
        if (response === null)
            return new BigNumber(0);
        
        return response.miner.reward;
    }

    /**
     * Set new reward for miner if it exists
     * @param minerAddress
     * @param reward
     * @returns {boolean} true/false if miner exists or not
     */
    setMinerReward(minerAddress, reward){
        
        let response = this.getMiner(minerAddress);
        if (response === null)
            return false;
        
        response.miner.reward = reward;
        
        return true;
    }
    
    /**
     * @param minerAddress
     * @param reward
     */
    increaseMinerReward(minerAddress, reward) {

        for (let i = 0; i < this._minersList.length; ++i) {
            if (this._minersList[i].address === minerAddress){
                this._minersList[i].reward = this._minersList[i].reward.plus(reward);
                break;
            }
        }
    }
    
    _serializeMiners() {
        
        let list = [Serialization.serializeNumber2Bytes(this._minersList.length)];

        for (let i = 0; i < this._minersList.length; ++i) {

            list.push( Serialization.serializeNumber1Byte(BufferExtended.fromBase(this._minersList[i].address).length) );
            list.push( BufferExtended.fromBase(this._minersList[i].address) );
            
            list.push ( Serialization.serializeBigNumber(this._minersList[i].reward) );
        }

        return Buffer.concat(list);
    }
    
    _deserializeMiners(buffer, offset = 0) {

        try {
            
            let numMiners = Serialization.deserializeNumber( BufferExtended.substr( buffer, offset, 2 ) );
            offset += 2;

            this._minersList = [];
            for (let i = 0; i < numMiners; ++i) {

                let len = Serialization.deserializeNumber( BufferExtended.substr( buffer, offset, 1 ) );
                offset += 1;

                let minerAddress = BufferExtended.toBase( BufferExtended.substr(buffer, offset, len) );
                offset += len;
                
                let response = Serialization.deserializeBigNumber(buffer, offset);
                let minerReward = response.number;
                offset = response.newOffset;

                this._minersList.push( {address: minerAddress, reward: minerReward} );
            }
            
            return true;

        } catch (exception){
            console.log("Error deserialize minersList. ", exception);
            throw exception;
        }
    }
    
    /**
     * Load _minersList from database
     * @returns {boolean} true is success, otherwise false
     */
    async loadMinersList() {
        
        try{

            let buffer = await this.db.get("minersList");
            let response = this._deserializeMiners(buffer);
            
            if (response !== true){
                console.log('Unable to load _minersList from DB');
                return false;
            }
            
            return true;
        }
        catch (exception){

            console.log('ERROR loading _minersList from BD: ',  exception);
            return false;
        }
    }

    /**
     * Save _minersList to database
     * @returns {boolean} true is success, otherwise false
     */
    async saveMinersList() {

        try{

            let buffer = this._serializeMiners();
            
            let response = await this.db.save("minersList", buffer);
            if (response !== true) {
                console.log('Unable to save _minersList to DB');
                return false;
            }
            
            return true;
        }
        catch (exception){

            console.log('ERROR saving _minersList in DB: ',  exception);
            return false;
        }
    }

    /**
     * @param minersList
     * @returns {boolean} true if this._minersList === minersList
     */
    compareMinersList(minersList) {

        if (minersList.length !== this._minersList.length)
            return true;

        for (let i = 0; i < this._minersList; ++i){
            if (this._minersList[i].address !== minersList[i].address)
                return true;
        }

        return false;
    }

    /**
     * @param miner1
     * @param miner2
     * @returns {boolean} true if miners are equal
     */
    compareMiners(miner1, miner2) {

        return !( typeof miner1 === typeof miner2 &&
            miner1.address === miner2.address &&
            miner1.reward.equals(miner2.reward) );
    }

}

export default PoolData;