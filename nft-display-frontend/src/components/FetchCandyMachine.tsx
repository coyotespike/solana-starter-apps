import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { Metaplex } from "@metaplex-foundation/js";
import { FC, useEffect, useState } from "react";
import styles from "../styles/custom.module.css";

export const FetchCandyMachine: FC = () => {
  const [candyMachineAddress, setCandyMachineAddress] = useState(
    "6mmBfcPHvEkW7oXFVvKKqHWwQLJ5NxFvYECvSLWi6AUw"
  );
  const [candyMachineData, setCandyMachineData] = useState(null);
  const [pageItems, setPageItems] = useState(null);
  const [page, setPage] = useState(1);

  const { connection } = useConnection();
  const metaplex = Metaplex.make(connection);

  const fetchCandyMachine = async () => {
    // because we will be fetching a new candy machine, start with a clean slate
    setPage(1);

    try {
      const candyMachine = await metaplex
        .candyMachinesV2()
        .findByAddress({ address: new PublicKey(candyMachineAddress) });

      setCandyMachineData(candyMachine);
    } catch (error) {
      console.log(error);
    }
  };

  // slice items array into chunks of 10
  const getPage = async (page, perPage) => {
    const pageItems = candyMachineData.items.slice(
      (page - 1) * perPage,
      page * perPage
    );
    let nftData = [];
    await Promise.all(
      pageItems.map(async (nft) => {
        let fetchResult = await fetch(nft.uri);
        let json = await fetchResult.json();
        nftData.push(json);
      })
    );

    setPageItems(nftData);
  };

  const prev = async () => {
    if (page - 1 < 1) {
      setPage(1);
    } else {
      setPage(page - 1);
    }
  };

  const next = async () => {
    setPage(page + 1);
  };

  // fetch candy machine data on load
  useEffect(() => {
    fetchCandyMachine();
  }, []);

  // fetch items when candy machine data is available
  useEffect(() => {
    if (!candyMachineData?.items) {
      return;
    }
    getPage(page, 10);
  }, [candyMachineData, page]);

  return (
    <div>
      <input
        type="text"
        className="form-control block mb-2 w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none text-center"
        placeholder="Enter Candy Machine v2 Address"
        onChange={(e) => setCandyMachineAddress(e.target.value)}
      />
      <button
        className="px-8 m-2 btn animate-pulse bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 ..."
        onClick={fetchCandyMachine}
      >
        Fetch
      </button>

      {candyMachineData && (
        <div className="flex flex-col items-center justify-center p-5">
          <ul>
            Candy Machine Address: {candyMachineData?.address?.toString()}
          </ul>
        </div>
      )}

      {pageItems && (
        <div>
          <div className={styles.gridNFT}>
            {pageItems.map((nft) => (
              <div>
                <ul>{nft.name}</ul>
                <img src={nft.image} />
              </div>
            ))}
          </div>
          <button
            className="px-8 m-2 btn animate-pulse bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 ..."
            onClick={prev}
          >
            Prev
          </button>
          <button
            className="px-8 m-2 btn animate-pulse bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:from-pink-500 hover:to-yellow-500 ..."
            onClick={next}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
