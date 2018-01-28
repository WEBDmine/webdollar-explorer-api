import WebDollarCrypto from "../../common/crypto/WebDollar-Crypto";

var assert = require('assert');

import Blockchain from 'main-blockchain/Blockchain';
import InterfaceSatoshminDB from 'common/satoshmindb/Interface-SatoshminDB';
import MultiSig from 'common/blockchain/interface-blockchain/addresses/MultiSig';

describe('test save wallet to local storage', () => {

    let response = null;

    it('save/load/remove/load wallet to/from local storage, sample test', async () => {

        let blockchainAddress = await Blockchain.Wallet.createNewAddress();
        let address = blockchainAddress.address;
        let unencodedAddress = blockchainAddress.unencodedAddress;
        let publicKey = blockchainAddress.publicKey;
        let privateKey = await blockchainAddress.getPrivateKey();

        assert(typeof address === "string", "address is not a string");
        assert(Buffer.isBuffer(unencodedAddress), "unencodedAddress is not not buffer");
        assert(Buffer.isBuffer(publicKey), "publicKey is not not buffer");
        assert(Buffer.isBuffer(privateKey), "privateKey is not not buffer");

        response = await blockchainAddress.save();
        assert(response === true, 'save: ' + response);

        response = await blockchainAddress.load();
        assert(response === true, 'load: ' + response);

        let address2 = blockchainAddress.address;
        let unencodedAddress2 = blockchainAddress.unencodedAddress;
        let publicKey2 = blockchainAddress.publicKey;
        let privateKey2 = await blockchainAddress.getPrivateKey();

        assert(address2 === address, 'address differ after load: ' + address2 + '!==' + address);
        assert(unencodedAddress2.equals(unencodedAddress), 'unencodedAddress differ after load: ' + unencodedAddress2.toString('hex') + '!==' + unencodedAddress.toString('hex'));
        assert(publicKey2.equals(publicKey), 'publicKey differ after load: ' + publicKey2.toString('hex') + '!==' + publicKey.toString('hex'));
        assert(privateKey2.equals(privateKey), 'privateKey differ after load: ' + privateKey2.toString('hex') + '!==' + privateKey.toString('hex'));

        response = await blockchainAddress.remove();
        assert(response === true, 'remove: ' + response);

        response = await blockchainAddress.load();
        assert(response !== true, 'load: ' + response);
    });

    it('save/save/remove/load/ wallet to/from local storage, sample test', async () => {

        let blockchainAddress = await Blockchain.Wallet.createNewAddress();
        let address = blockchainAddress.address;
        let unencodedAddress = blockchainAddress.unencodedAddress;
        let publicKey = blockchainAddress.publicKey;
        let privateKey = await blockchainAddress.getPrivateKey();

        response = await blockchainAddress.save();
        assert(response === true, 'save: ' + response);

        response = await blockchainAddress.save();
        assert(response === true, 'save: ' + response);

        response = await blockchainAddress.remove();
        assert(response === true, 'remove: ' + response);

        response = await blockchainAddress.load();
        assert(response !== true, 'load: ' + response);

    });


    it('test save/load/remove/load with AES encrypt/decrypt privateKey', async () => {

        let blockchainAddress = await Blockchain.Wallet.createNewAddress();
        let address = blockchainAddress.address;
        let unencodedAddress = blockchainAddress.unencodedAddress;
        let publicKey = blockchainAddress.publicKey;
        let privateKey = await blockchainAddress.getPrivateKey();
        let password = 'password';

        //blockchainAddress.encrypt(password);

        response = await blockchainAddress.save();
        assert(response === true, 'save: ' + response);

        response = await blockchainAddress.load();
        assert(response === true, 'load: ' + response);

        let address2 = blockchainAddress.address;
        let unencodedAddress2 = blockchainAddress.unencodedAddress;
        let publicKey2 = blockchainAddress.publicKey;
        let privateKey2 = await blockchainAddress.getPrivateKey();

        assert(address2 === address, 'address differ after load: ' + address2 + '!==' + address);
        assert(unencodedAddress2.equals(unencodedAddress), 'unencodedAddress differ after load: ' + unencodedAddress2.toString('hex') + '!==' + address.toString('hex'));
        assert(publicKey2.equals(publicKey), 'publicKey differ after load: ' + publicKey2.toString('hex') + '!==' + publicKey.toString('hex'));
        assert(privateKey2.equals(privateKey), 'privateKey differ after load: ' + privateKey2.toString('hex') + '!==' + privateKey.toString('hex'));

        response = await blockchainAddress.remove();
        assert(response === true, 'remove: ' + response);

        response = await blockchainAddress.load();
        assert(response !== true, 'load: ' + response);

    });


    it('load/store wallet manager', async () => {

        assert(typeof Blockchain.Wallet.addresses !== 'undefined', 'Default wallet is not created');

    });

    it('update wallet password', async () => {

        let blockchainAddress = Blockchain.Wallet.addresses[0];
        let address = blockchainAddress.address;
        let unencodedAddress = blockchainAddress.unencodedAddress;
        let publicKey = blockchainAddress.publicKey;
        let privateKey = await blockchainAddress.getPrivateKey();

        await Blockchain.Wallet.updatePassword('new_password');

        let blockchainAddress2 = Blockchain.Wallet.addresses[0];

        let address2 = blockchainAddress2.address;
        let unencodedAddress2 = blockchainAddress2.unencodedAddress;
        let publicKey2 = blockchainAddress2.publicKey;
        let privateKey2 = await blockchainAddress2.getPrivateKey();

        assert(address2 === address, 'address differ after load: ' + address2 + '!==' + address);
        assert(unencodedAddress2.equals(unencodedAddress), 'unencodedAddress differ after load: ' + unencodedAddress2.toString('hex') + '!==' + address.toString('hex'));
        assert(publicKey2.equals(publicKey), 'publicKey differ after load: ' + publicKey2.toString('hex') + '!==' + publicKey.toString('hex'));
        assert(privateKey2.equals(privateKey), 'privateKey differ after load: ' + privateKey2.toString('hex') + '!==' + privateKey.toString('hex'));

    });

    it('test export/import wallet addresses', async () => {

        let addresses = Blockchain.Wallet.addresses;

        response = await Blockchain.Wallet.exportAddresses("addresses.bin");
        assert(response === true, "Error exporting addresses! : " + response + ".");
        Blockchain.Wallet.addresses = [];

        response = await Blockchain.Wallet.importAddresses("addresses.bin");
        assert(response === true, "Error importing addresses!");
        assert(addresses.length === Blockchain.Wallet.addresses.length, "Addresses length differ after import: " + addresses.length + "!==" + Blockchain.Wallet.addresses.length);

        for (let i = 0; i < addresses.length; ++i){
            assert(addresses[i].address.toString() === Blockchain.Wallet.addresses[i].address.toString(), "Addresses differ after import:" + addresses[i].address + "!==" + Blockchain.Wallet.addresses[i].address);
        }

    });


    it('test export/import wallet privateKeys', async () => {

    });

    it('test create public/private Keys', async () => {

        let privateKey1 =  MultiSig.createPrivateKey(['datanastere1','val','pllui']);
        let privateKey2 =  MultiSig.createPrivateKey(['datanastere2','val','pllui']);
        let privateKey3 =  MultiSig.createPrivateKey(['datanastere1','val','pllui']);

        let publicKey1 = MultiSig.getPublicKeyFromPrivate(privateKey1);
        let publicKey2 = MultiSig.getPublicKeyFromPrivate(privateKey2);
        let publicKey3 = MultiSig.getPublicKeyFromPrivate(privateKey3);

        assert(publicKey1.equals(publicKey3), "Public keys are different");
        assert(!publicKey1.equals(publicKey2), "Public keys are equal");
    });

    it('test check signature validity', async () => {

        let privateKey =  MultiSig.createPrivateKey(['datanastere1','plm','pllui']);
        let publicKey = MultiSig.getPublicKeyFromPrivate(privateKey);

        let msg = WebDollarCrypto.getBufferRandomValues(32);
        let signedMessage = MultiSig.signMessage(msg, privateKey);

        let response = MultiSig.validateSignedMessage(msg, signedMessage, publicKey);

        assert(response === true, "Error validating message");

    });

});
