import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { motion } from "framer-motion";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const Result = () => {
  const [image, setImage] = useState(assets.sample_img_2);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");

  const { generateImage } = useContext(AppContext);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!input.trim()) {
      toast.error("Please enter a prompt to generate an image");
      return;
    }

    setLoading(true);

    try {
      const image = await generateImage(input.trim());
      if (image) {
        setIsImageLoaded(true);
        setImage(image);
        setInput(""); // Clear input after successful generation
      }
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Failed to generate image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAnother = () => {
    setIsImageLoaded(false);
    setImage(assets.sample_img_2);
    setInput("");
  };

  return (
    <motion.form
      initial={{ opacity: 0.2, y: 100 }}
      transition={{ duration: 1 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onSubmit={onSubmitHandler}
      className="flex flex-col min-h-[90vh] justify-center items-center"
    >
      <div>
        <div className="relative">
          <img
            src={image}
            alt="Generated or sample"
            className="max-w-sm rounded"
          />
          <span
            className={`absolute bottom-0 left-0 h-1 bg-red-500 ${
              loading ? "w-full transition-all duration-[10s]" : "w-0"
            }`}
          />
        </div>
        <p className={!loading ? "hidden" : "text-center mt-2"}>
          Generating.....
        </p>
      </div>

      {!isImageLoaded && (
        <div className="flex w-full max-w-xl bg-neutral-500 text-white text-sm p-0.5 mt-10 rounded-full">
          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            type="text"
            placeholder="Describe your idea, and our AI will generate it!"
            className="flex-1 bg-transparent outline-none ml-8 max-sm:w-20 placeholder-gray-300"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className={`px-10 sm:px-16 py-3 rounded-full ${
              loading || !input.trim()
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-pink-700 hover:bg-pink-800"
            } transition-colors`}
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>
      )}

      {isImageLoaded && (
        <div className="flex gap-2 flex-wrap justify-center text-white text-sm p-0.5 mt-10 rounded-full">
          <p
            onClick={handleGenerateAnother}
            className="bg-transparent border border-zinc-900 text-black px-8 py-3 rounded-full cursor-pointer hover:bg-gray-100 transition-colors"
          >
            Generate Another
          </p>
          <a
            href={image}
            download="generated-image.png"
            className="bg-yellow-900 px-10 py-3 rounded-full cursor-pointer hover:bg-yellow-800 transition-colors"
          >
            Download
          </a>
        </div>
      )}
    </motion.form>
  );
};

export default Result;
