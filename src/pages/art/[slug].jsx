import Head from "next/head";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { colors } from "../../assets/data/colors";
import { ImFolderUpload, ImFolderDownload } from "react-icons/im";
import Button from "../../components/common/Button";
import { app } from "../_app";
import { collection, getFirestore, query, where, getDocs } from "firebase/firestore";
import axios from "axios";
import NavBar from "../../components/NavBar";

export default function Art({data}) {
  const [selectedColor, setSelectedColor] = useState("#FFFFFF");
  const [svgData, setSvgData] = useState(data);
  const [showUp, setShowUp] = useState(false);
  const [boxHeight, setBoxHeight] = useState(0);
  const artRef = useRef(null);
  const selectColorRef = useRef(null);
  const updateColor = useCallback(
    (element, color) => {
      element.setAttribute("fill", color ? color : selectedColor);
    },
    [selectedColor]
  );

  useEffect(() => {
    if (artRef.current) {
      artRef.current?.children[0]?.setAttribute("width", "100vw");
      artRef.current?.children[0]?.setAttribute("height", "75vh");
    }
  }, [artRef.current]);

  useEffect(() => {
    const paths = document.getElementsByTagName("path");
    for (let i = 0; i < paths?.length; i++) {
      paths[i].classList.add("cursor-pointer");
      paths[i].addEventListener("click", () => {
        updateColor(paths[i]);
      });
    }
    return () => {
      for (let i = 0; i < paths?.length; i++) {
        paths[i].removeEventListener("click", () => {
          console.log(paths[i], "remove");
        });
      }
    };
    //eslint-disable-next-line
  }, [artRef.current, selectedColor, updateColor]);

  const fillWithRandomColors = () => {
    const paths = document.getElementsByTagName("path");
    for (let i = 0; i < paths?.length; i++) {
      var randomNum = Math.floor(Math.random() * colors.length + 1);
      updateColor(paths[i], colors[randomNum]);
    }
  };
  const clearColors = () => {
    const paths = document.getElementsByTagName("path");
    for (let i = 0; i < paths?.length; i++) {
      updateColor(paths[i], "#FFFFFF");
    }
  };

  return (
    <div>
      <Head>
        <title>Coloring Book</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NavBar />
      <div className="relative overflow-hidden min-h-[75vh]">
        <div
          id="art"
          className="flex flex-row justify-center"
          dangerouslySetInnerHTML={{ __html: svgData }}
          ref={artRef}
        ></div>
        
      </div>

      <div className="md:flex hidden flex-row gap-4 justify-center mt-1 mb-20">
        <Button text="Clear Color" onClick={clearColors} />
        <Button text="Random Color" onClick={fillWithRandomColors} />
      </div>
      <div className="w-full hidden md:flex  flex-row justify-center  items-center">
          <div className="flex flex-col fixed -bottom-[390px] hover:bottom-0 self-center w-[525px]  duration-500 transition-all rounded-md bg-gray-500">
            <div
              className="bg-white text-black border border-black font-bold text-center py-2 my-2 px-3 mx-3 rounded-lg"
              style={{ backgroundColor: selectedColor }}
            >
              SELECT COLOR
            </div>
            <div className="flex flex-row flex-wrap justify-start gap-4 px-3 py-2 mx-3">
              {colors.map((color, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedColor(color)}
                  className="h-10 w-10 rounded-md shadow-md cursor-pointer hover:border hover:border-white"
                  style={{ backgroundColor: color }}
                ></div>
              ))}
            </div>
          </div>
      </div>
      <div className="flex flex-col md:hidden bg-black fixed bottom-0 left-0 w-full">
        <div className="flex md:hidden z-50 bg-black py-4 px-6 w-full justify-between">
          <div
            className="text-white cursor-pointer z-50 bg-gray-500 p-2 rounded"
            onClick={clearColors}
          >
            clear
          </div>
          <div
            className="text-white cursor-pointer z-50 bg-gray-500 p-2 rounded"
            onClick={fillWithRandomColors}
          >
            random
          </div>
        </div>
        <div className="w-full flex flex-row justify-center  items-center">
          <div
            ref={selectColorRef}
            className={`flex flex-col absolute ${
              showUp ? "bottom-20" : `-bottom-[${selectColorRef.current?.clientHeight - 132}px]`
            } self-center  duration-500 transition-all rounded-md bg-gray-500`}
          >
            <div
              className="bg-white text-black border border-black font-bold text-center py-2 my-2 px-3 mx-3 rounded-lg"
              style={{ backgroundColor: selectedColor }}
              onClick={(e) => {
                e.stopPropagation();
                setShowUp(true);
              }}
            >
              SELECT COLOR
            </div>
            <div className="flex flex-row flex-wrap justify-start gap-4 px-3 py-2 mx-3">
              {colors.map((color, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedColor(color);
                    setShowUp(false);
                  }}
                  className="h-10 w-10 rounded-md shadow-md cursor-pointer hover:border hover:border-white"
                  style={{ backgroundColor: color }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps({params}) {

    let url;
    const db = getFirestore(app);
    const q = query(collection(db, "arts"), where("id", "==", params.slug));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        url = doc.data().url;
    })
    if(!url){
        return { props : { data : null }}
    }
    const { data } = await axios.get(url);

    return { props: { data } }
  }
