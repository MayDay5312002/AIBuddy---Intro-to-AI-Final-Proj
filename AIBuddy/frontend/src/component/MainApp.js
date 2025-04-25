import React from "react";
import { useState, useEffect } from "react";
import { Button, TextField, Typography } from "@mui/material";

import axios from "axios";

const MainApp = () => {
    const [file, setFile] = useState(null);
    const [url, setUrl] = useState("");
    const [query, setQuery] = useState("");
    const [response, setResponse] = useState("");


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
        formData.append("file", file);
        formData.append("url", url);
        axios.post("http://127.0.0.1:8000/api/fileUpload/", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            }
        })
    }

    const handleQuery = () => {
        axios.get('http://127.0.0.1:8000/api/query/?query=' + query).then((response) => {
            // console.log(response)
            setResponse(response.data["msg"])
        })
    }

    useEffect(() => {
        console.log(file)

    }, [file])
    return (
        <div className="center">
            <Typography variant="h4" sx={{fontWeight: "bold"}}>AI Buddy - Type Shit</Typography>
            <input
              accept="*"
              type="file"
              id="file-upload"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <label htmlFor="file-upload">
              <Button variant="contained" component="span">
                Upload File
              </Button>
            </label>
            {/* <Button variant="contained" component="span" onClick={handleSubmitFile}>
                Submit
            </Button> */}
            <TextField
              label="Enter something"
              variant="outlined"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              fullWidth
            />
            <Button variant="contained" component="span" onClick={handleSubmitFile}>
                Submit
            </Button>
            <TextField
              label="Enter something"
              variant="outlined"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              fullWidth
            />
            <Button variant="contained" onClick={handleQuery}>
                Submit Query
            </Button>
            <Typography variant="h5" sx={{fontWeight: "bold"}}>{response}</Typography>
        </div>
    );
};

export default MainApp;