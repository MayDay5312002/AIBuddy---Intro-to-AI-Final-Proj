import React from "react";
import { useState, useEffect } from "react";
import { Button, TextField, Typography, Select, MenuItem, FormControl, InputLabel, Box, Radio, RadioGroup, FormControlLabel, FormLabel } from "@mui/material";

import axios from "axios";

const MainApp = () => {
    const [file, setFile] = useState(null);
    const [url, setUrl] = useState("");
    const [query, setQuery] = useState("");
    const [response, setResponse] = useState("");
    const [models, setModels] = useState([])
    const [readToQuery, setReadToQuery] = useState(false);
    const [inputType, setInputType] = useState("file");
    // const []

    const [selectedModel, setSelectedModel] = useState("");

    

    const handleSelectedChange = (event) => {
      setSelectedModel(event.target.value);
    };


    const handleFileChange = (event) => {
        const fileTemp = event.target.files[0];
        if (fileTemp) {
        //   console.log("Selected file:", file.name);
          setFile(fileTemp)
        //   console.log(file)
          // You can now upload or process the file
        }
    };

    const handleSubmitFile = () => {
        const formData = new FormData();
        if(inputType === "file"){
          if(inputType===null){return}
          formData.append("file", file);
        }
        else if(inputType === "url"){
          if(inputType===""){return}
          formData.append("url", url);
        }
        // formData.append("url", url);
        axios.post("http://127.0.0.1:8000/api/fileUpload/", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            }
        })
        .then((response) => {
            // console.log(response)
            // setResponse(response.data["msg"])
            setReadToQuery(true);

        })
        .catch((error) => {
            console.error("Error uploading file:", error);
        });
    }

    // const handleQuery = () => {
        // axios.get('http://127.0.0.1:8000/api/chat/?query=' + query + '&model=' + selectedModel).then((response) => {
        //     // console.log(response)
        //     setResponse(response.data["msg"])
        // })
    // }
    const handleQuery = () => {
        setResponse(''); // clear old response
      
        const eventSource = new EventSource('http://localhost:8000/api/chatStream/' + '?query=' + query + '&model=' + selectedModel);
      
        eventSource.onmessage = function(event) {
            setResponse(prev => prev + event.data);
        };
      
        eventSource.onerror = function(err) {
            console.error('EventSource failed:', err);
            eventSource.close();
        };
      
        return () => {
            eventSource.close();
        };
    };

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/api/models/')
        .then((response) => {
            // console.log(response)
            setModels(response.data["models"])
            setSelectedModel(response.data["models"][0])
        })
        .catch((error) => {
            console.error("Error uploading file:", error);
        })
    }, [])

    useEffect(() => {
        console.log(file)

    }, [file]);

    const handleRadioChange = (event) => {
      setInputType(event.target.value);
  };

    return (
        <div>

            <Typography variant="h4" sx={{fontWeight: "bold", marginBottom: "1em", textAlign: "center"}}>AI Buddy</Typography>

            <FormControl>
              <FormLabel>Choose Input Type</FormLabel>
              <RadioGroup
                row
                value={inputType}
                onChange={handleRadioChange}
              >
                <FormControlLabel value="file" control={<Radio />} label="Upload a File" />
                <FormControlLabel value="url" control={<Radio />} label="Enter a youtube URL" />
              </RadioGroup>
            </FormControl>
            <FormControl fullWidth style={{marginTop: "1em", marginBottom: "1em"}}>
              <InputLabel id="dropdown-label">Select model</InputLabel>
              <Select
                labelId="dropdown-label"
                value={selectedModel}
                label="Select Model"
                onChange={handleSelectedChange}
              >
                {models.map((model, index) => (
                  <MenuItem key={index} value={model}>
                    {model}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {inputType === "file" &&
            <Box sx={{my: "1em"}}>
              <input
                accept="*"
                type="file"
                id="file-upload"
                style={{ display: "none" }}
                onChange={handleFileChange}
                component="span"
              />
              <label htmlFor="file-upload">
                <Button variant="contained" component="span">
                  Upload File
                </Button>
              </label>
              <Typography variant="body2">Selected file: {file ? file.name : "No file selected" }</Typography>
            </Box>
            }
            {inputType === "url" && 
            <>
            <TextField
              label="Enter URL"
              variant="outlined"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              fullWidth
            />
            {/* <Button variant="contained" component="span" onClick={handleSubmitFile}>
                Submit
            </Button> */}
            </>
            }
            <Button variant="contained" component="span" onClick={handleSubmitFile}>
                Submit {(inputType === "file") ? "File" : "Youtube URL"}
            </Button>
            <TextField
              label="Enter Question"
              variant="outlined"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              sx={{my: "1em"}}
              fullWidth
            />
            <Button variant="contained" onClick={handleQuery} disabled={readToQuery == false}>
                Submit Query
            </Button>
            <Typography variant="h5" sx={{fontWeight: "bold"}}>{response}</Typography>
        </div>
    );
};

export default MainApp;