# JAVASCRIPT EXAMPLES FOR PSS

pss is an upcoming remote messaging platform on the go-ethereum platform. It is currently being merged into go-ethereum master branch, but the cutting-edge version of the module can be experimented with on this branch:

https://github.com/ethersphere/go-ethereum/tree/swarm-network-rewrite

## USAGE

To use these examples you need two running go-ethereum pss node instances on the ports given in the scripts.

1. Compile geth:

   `go build -v -o <desired-path-to-geth-binary> $GOPATH/src/github.com/ethereum/go-ethereum/cmd/geth`
  
2. Compile swarm:

   `go build -v -o <desired-path-to-swarm-binary> $GOPATH/src/github.com/ethereum/go-ethereum/cmd/swarm`

3. Create two data directories:

   ```
   <geth-binary> --datadir <path-to-datadir-A> account new
   <geth-binary> --datadir <path-to-datadir-B> account new
   ```

   you will have to enter passwords for these dirs. Enter something simple and DON'T use them for anything sensitive afterwards.

4. Start two swarm nodes once to create the bzzaccount.

   `<swarm-binary> --datadir <path-to-datadir> --ethapi ''`

5. Start two swarm nodes proper, with pss:

   ```
   <swarm-binary> --datadir <path-to-datadir-A> --bzzaccount <bzzaccount-in-datadir> --ens-api '' --pss --ws --wsport 8546 --port 30399
   <swarm-binary> --datadir <path-to-datadir-B> --bzzaccount <bzzaccount-in-datadir> --ens-api '' --pss --ws --wsport 8547 --port 30400
   ```

6. Connect one to the other;

   a) retrieve the enode from A:

   `ENODE=geth --exec "admin.nodeInfo.enode" attach <path-to-datadir-A>/bzzd.ipc`

   b) use it to connect with B:

   `geth --exec "admin.addPeer($ENODE)" attach <path-to-datadir-B>/bzzd.ipc`
   
7. Run the javascript

**Phew!**

(A script would make that easier, actually.)

## DEPENDENCIES

* go-ethereum: https://github.com/ethersphere/go-ethereum/tree/network-testing-framework

## LICENSE

MIT
