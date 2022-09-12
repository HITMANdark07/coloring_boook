import Head from "next/head";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { colors } from "../assets/data/colors";
import { ImFolderUpload, ImFolderDownload } from "react-icons/im";
import { IoCopyOutline } from "react-icons/io5";
import { AiOutlineClose } from "react-icons/ai";
import { toast } from "react-toastify";
import { v4 as uuid } from "uuid";
import Button from "../components/common/Button";
import Link from "next/link";
import { app } from "./_app";
import {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";
import { collection, addDoc, getFirestore } from "firebase/firestore";
import { useRouter } from "next/router";
import axios from "axios";
import NavBar from "../components/NavBar";

export default function Home() {
  const [selectedColor, setSelectedColor] = useState("#FFFFFF");
  const [svgData, setSvgData] = useState("");
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showUp, setShowUp] = useState(false);
  const [boxHeight, setBoxHeight] = useState(0);
  const artRef = useRef(null);
  const selectColorRef = useRef(null);
  const router = useRouter();
  const storage = useMemo(() => getStorage(app));
  const [artId, setArtId] = useState(null);
  const db = useMemo(() => getFirestore(app));
  const updateColor = useCallback(
    (element, color) => {
      element.setAttribute("fill", color ? color : selectedColor);
    },
    [selectedColor]
  );

  const getSvgAndAddEventListeners = async () => {
    try {
      const { data } = await axios.get(
        `https://s3-us-west-2.amazonaws.com/s.cdpn.io/40041/cheshire.svg`
      );
      setSvgData(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getSvgAndAddEventListeners();
  }, []);
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

  const downloadSvg = () => {
    const svgInfo = new XMLSerializer().serializeToString(
      document.querySelector("svg")
    );
    const base64Data = btoa(svgInfo);
    let download = document.createElement("a");
    document.body.appendChild(download);
    download.setAttribute("href", "data:image/svg+xml;base64," + base64Data);
    download.setAttribute("download", "coloring_book.svg");
    download.click();
  };
  useEffect(() => {
    let user = JSON.parse(localStorage.getItem("auth"));
    if (!user?.accessToken) {
      setUser(user);
      router.replace("/login");
    }
  }, [user]);

  const logout = () => {
    localStorage.removeItem("auth");
    router.reload();
    setUser(null);
  };
  const getSvgFromUrl = async (url) => {
    try {
      const response = await fetch(url);
      const data = await response.text();
      setSvgData(data);
    } catch (error) {
      console.log(error);
    }
  };
  const handleUpload = (event) => {
    let file = event.target.files[0];
    const fileName = uuid();
    const fileRef = ref(storage, `files/${fileName}.svg`);
    const uploadTask = uploadBytesResumable(fileRef, file);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setProgress(progress);
      },
      (error) => {
        toast.error(error?.code?.split("/")[1]?.split("-")?.join(" "));
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
          try {
            await addDoc(collection(db, "arts"), {
              url: downloadURL,
              id: fileName,
            });
            getSvgFromUrl(downloadURL);
            setArtId(fileName);
            setShowShareModal(true);
            toast.success("File Uploaded Successfully");
          } catch (error) {
            console.log(error);
            toast.error(error?.code?.split("/")[1]?.split("-")?.join(" "));
          }
        });
      }
    );
    // var fr = new FileReader();
    // fr.onload = function () {
    //   setSvgData(fr.result);
    // };
    // fr.readAsText(file);
  };

  useEffect(() => {
    if (artRef.current) {
      artRef.current?.children[0]?.setAttribute("width", "100vw");
      artRef.current?.children[0]?.setAttribute("height", "75vh");
    }
  }, [artRef.current]);

  useEffect(() => {
    if (selectColorRef.current) {
      const width = selectColorRef.current.clientHeight;
      setBoxHeight(width);
    }
  }, [selectColorRef.current]);

  return (
    <div>
      <Head>
        <title>Coloring Book</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NavBar isLoggedIn={true} logout={logout} />
      {showShareModal && (
        <div className="fixed z-40 top-0 left-0 bg-black bg-opacity-75 h-screen w-screen flex flex-col justify-center">
          <div className="w-full flex gap-6 flex-col mx-4 lg:w-1/3 p-4 lg:mx-0 shadow-lg self-center rounded bg-white">
            <div className="flex w-full justify-between">
              <div className="text-2xl font-semibold">SHARE ART</div>
              <AiOutlineClose
                color="#000"
                className="cursor-pointer"
                size={20}
                onClick={() => {
                  setShowShareModal(false);
                }}
              />
            </div>
            <div className="relative">
              <input
                type="text"
                disabled
                className="w-full outline-none border border-gray-400 p-2 rounded"
                value={`${process.env.BASE_URL}/art/${artId}`}
              />
              <IoCopyOutline
                className="absolute right-2 bg-white p-1 rounded cursor-pointer top-2"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${process.env.BASE_URL}/art/${artId}`
                  );
                  toast.success("Copied to clipboard");
                }}
                size={20}
              />
            </div>
            <Link href={`/art/${artId}`} target="_blank">
              <a
                target="_blank"
                className="text-blue-400 text-sm cursor-pointer"
              >
                Click to View
              </a>
            </Link>
          </div>
        </div>
      )}
      <div className="relative overflow-hidden min-h-[75vh]">
        <div
          id="art"
          className="flex w-full flex-row justify-center"
          dangerouslySetInnerHTML={{ __html: svgData }}
          ref={artRef}
        ></div>
      </div>
      <div className="flex w-full mx-2 lg:w-1/2 gap-4 lg:mx-auto items-center flex-col self-center justify-center">
        {progress > 0 && <div className="text-2xl">{progress}%</div>}
        <div
          className={`lg:w-[${progress}%] self-center bg-blue-600 h-4`}
        ></div>
      </div>
      <div className="md:flex hidden flex-row gap-4 justify-center -mt-3 mb-20 ">
        <Button text="Clear Color" onClick={clearColors} />
        <Button text="Random Color" onClick={fillWithRandomColors} />
        <label htmlFor="uploadIp">
          <div className="border-none flex items-center gap-2 min-w-max  cursor-pointer rounded  bg-gray-900 text-white font-semibold px-5 py-3">
            <ImFolderUpload color="#fff" />
            <div>Upload</div>
          </div>
        </label>
        <Button text="Download Svg" onClick={downloadSvg} />
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
      <input
        type="file"
        accept=".svg"
        id="uploadIp"
        onChange={handleUpload}
        name="uploadIp"
        className="hidden"
      />

      <div className="flex flex-col md:hidden bg-black fixed bottom-0 left-0 w-full">
        <div className="flex md:hidden z-40 bg-black py-4 px-6 w-full justify-between">
          <div
            className="text-white cursor-pointer bg-gray-500 p-2 rounded"
            onClick={clearColors}
          >
            clear
          </div>
          <div
            className="text-white cursor-pointer bg-gray-500 p-2 rounded"
            onClick={fillWithRandomColors}
          >
            random
          </div>
          <label
            htmlFor="uploadIp"
            className="text-white cursor-pointer flex items-center gap-2 bg-gray-500 p-2 rounded"
          >
            <ImFolderUpload color="#fff" />
            <div>upload</div>
          </label>
          <div
            onClick={downloadSvg}
            className="text-white cursor-pointer flex items-center gap-2 bg-gray-500 p-2 rounded"
          >
            <ImFolderDownload color="#FFFFFF" />
            <div>download</div>
          </div>
        </div>
        <div className="w-full flex flex-row justify-center  items-center">
          <div
            ref={selectColorRef}
            className={`flex flex-col absolute ${
              showUp ? "bottom-20" : `-bottom-[${boxHeight - 132}px]`
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
