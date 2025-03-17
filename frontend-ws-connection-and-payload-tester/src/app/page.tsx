import WS from "@/components/WS2";

export default function Home() {
  return (
    <div className="flex justify-center">
      <div className="flex justify-center h-dvh w-full max-w-3xl">
        <div className="py-6 pr-5 flex-1 flex">
          <WS
            initialConnectionURL={
              process.env.NEXT_PUBLIC_LOCAL_WS_URL as string
            }
          />
        </div>
        <div className="h-full w-[1px] flex items-center">
          <div className="h-[85%] w-full bg-gradient-to-b from-black/0 via-white/15 to-black/0" />
        </div>
        <div className="py-6 pl-5 flex-1 flex">
          <WS
            initialConnectionURL={
              process.env.NEXT_PUBLIC_API_GATEWAY_URL as string
            }
          />
        </div>
      </div>
    </div>
  );
}

{
  /* <WS /> */
}
{
  /* <WS /> */
}
