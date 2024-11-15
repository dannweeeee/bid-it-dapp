import { createPublicClient, http, fallback, Address } from "viem";
import { baseSepolia } from "viem/chains";
import { useEffect, useState } from "react";
import DutchAuctionAbi from "@/abis/DutchAuctionAbi";
import { BASE_SEPOLIA_RPC_URL } from "@/lib/constants";

interface AuctionStatus {
  isStarted: boolean;
  isEnded: boolean;
  currentTokenPrice: bigint;
  remainingTokens: bigint;
  soldTokens: bigint;
  timeRemaining: bigint;
}

export function useFetchAuctionStatus(auctionAddress: Address) {
  const [auctionStatus, setAuctionStatus] = useState<AuctionStatus | null>(
    null
  );

  useEffect(() => {
    async function fetchAuctionStatus() {
      try {
        const client = createPublicClient({
          chain: baseSepolia,
          transport: fallback([http(BASE_SEPOLIA_RPC_URL)]),
        });

        const result = await client.readContract({
          address: auctionAddress,
          abi: DutchAuctionAbi,
          functionName: "getAuctionStatus",
        });

        // Type assertion after converting to unknown
        const status = result as unknown as [
          boolean,
          boolean,
          bigint,
          bigint,
          bigint,
          bigint
        ];

        setAuctionStatus({
          isStarted: status[0],
          isEnded: status[1],
          currentTokenPrice: status[2],
          remainingTokens: status[3],
          soldTokens: status[4],
          timeRemaining: status[5],
        });
      } catch (err) {
        console.error("Failed to fetch auction status:", err);
      }
    }

    if (auctionAddress) {
      fetchAuctionStatus();
    }
  }, [auctionAddress]);

  return auctionStatus;
}
