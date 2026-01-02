"use cliente";

import Image from "next/image"

type TProp = {
    width: number;
    height: number
}
export const Logo = ({width, height}: TProp) => {
    return (
        <div className="flex justify-center items-center">
            <Image
                src="/assets/images/logo-2.png"
                alt="Logo"
                width={width}
                height={height}
                />
        </div>
    )
}