
import React, { useEffect, useRef, useState } from 'react'

import * as faceApi from "face-api.js"
import { RotateLoader } from "react-spinners";
 const NewPost = ({image}) => {
    const [load,setLoad]=useState(false);
    const{url,width,height}= image;
    // const [faces,setFaces]=useState([]);
    const [expressions,setExpressions]= useState([]);

    const imgRef= useRef();
    const canvasRef=useRef();

    const handleImage=async()=>{
        const detections= await faceApi.detectAllFaces(
            imgRef.current,
            new faceApi.TinyFaceDetectorOptions()
        ).withFaceLandmarks().withFaceExpressions();
        canvasRef.current.Html=faceApi.createCanvasFromMedia(imgRef.current);
        faceApi.matchDimensions(canvasRef.current,{
            width:940,
            height:650,
        })
    
        const resized =faceApi.resizeResults(detections,{
            width:940,
            height:650,  
        })

        faceApi.draw.drawDetections(canvasRef.current,resized);
        faceApi.draw.drawFaceExpressions(canvasRef.current,resized);
        faceApi.draw.drawFaceLandmarks(canvasRef.current,resized);

        if(resized.length>0){
            setExpressions(resized[0].expressions);
            setLoad(true);
        }

    };



    useEffect(()=>{
        const loadModels=()=>{
            Promise.all([
                faceApi.nets.tinyFaceDetector.loadFromUri("/models"),
                faceApi.nets.faceLandmark68Net.loadFromUri("/models"),
                faceApi.nets.faceExpressionNet.loadFromUri("/models"),
            ])
            .then(handleImage)
            .catch((e)=> console.log((e)))
        };
        imgRef.current && loadModels();

    },[])

    


    const exit=()=>{
        window.location.reload()
       }


  return (
    <div className="container">
        <div className='left' >
            <img ref={imgRef} crossOrigin="anonymous" src={url} alt=""    width="940"
            height="650"   />
        <canvas
         ref={canvasRef}
         width={width}
         height={height}  
        />

  
        </div>
        {load?
        <div className='right'>
          <h1>EXPRESSIONS DETECTED</h1>
          <ul>
            {Object.entries(expressions).map(([expression,probability])=>(
                <li key={expression} style={{listStyleType:'none',marginBottom:"10px",fontSize:"25px"}}>{emojiBasedOnExpression(expression)}{`${expression}:${Math.round(probability*100)}%`}</li>
            ))}
          </ul>
            <button className='rightButton' onClick={exit}>Go back</button>
        </div>:
       <div className='right'>
         <h1>EXPRESSIONS DETECTING...</h1>
         <RotateLoader/>

       
     </div>
 }


    </div>
  )
}

const emojiBasedOnExpression = (expression) => {
    const emojis = {
        neutral: '😐',
        happy: '😊',
        sad: '😢',
        angry: '😡',
        fearful: '😨',
        disgusted: '🤢',
        surprised: '😲',
    };

    return emojis[expression] || ''; 
};

export default NewPost;
