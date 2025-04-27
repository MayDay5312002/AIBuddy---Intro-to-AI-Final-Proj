import React from "react";
import { useState, useEffect } from "react";
import { Button, TextField, Typography, Select, MenuItem, FormControl, 
  InputLabel, Box, Radio, RadioGroup, FormControlLabel, FormLabel, Paper, Divider, IconButton, 
  CircularProgress} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

import BasicModalAdd from "../sub-component/BasicModalAdd.js";
import BasicModalDelete from "../sub-component/BasicModalDelete.js";

import axios from "axios";

const MainApp = () => {
    const [file, setFile] = useState(null);
    const [url, setUrl] = useState("");
    const [query, setQuery] = useState("");
    const [response, setResponse] = useState("");
    const [models, setModels] = useState([])
    const [readToQuery, setReadToQuery] = useState(false);
    const [inputType, setInputType] = useState("file");
    const [errorResponse, setErrorResponse] = useState("");
    const [colorOfResponse, setColorOfResponse] = useState("red");
    const [executionType, setExecutionType] = useState("Explain simply")

    const [threads, setThreads] = useState([]);
    const [selectedThread, setSelectedThread] = useState('');


    const [flashCards, setFlashCards] = useState([]);

    const [loading, setLoading] = useState(false);
    // const []

    const [selectedModel, setSelectedModel] = useState("");

    

    const handleSelectedChange = (event) => {
      setSelectedModel(event.target.value);
    };

    const handleExecuteQuery = (event) => {
      setExecutionType(event.target.value);
    }

    const handleSelectChange = (event) => {
      setSelectedThread(event.target.value);
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

    useEffect(() => {
      if(!threads.includes(selectedThread)){
        setSelectedThread("")
      }
    }, [threads])
    



    const handleSubmitFile = () => {
        const formData = new FormData();
        if(inputType === "file"){
          if(file===null){
            setColorOfResponse("red")
            setErrorResponse("Please select a file")
            setReadToQuery(false)
            return
          }
          formData.append("file", file);
        }
        else if(inputType === "url"){
          if(url===""){
            setColorOfResponse("red")
            setErrorResponse("Please enter a url")
            setReadToQuery(false)
            return
          }
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
            setColorOfResponse("green")
            setErrorResponse("Success")
            setReadToQuery(true);

        })
        .catch((error) => {
            setColorOfResponse("red")
            setErrorResponse("Error")
            console.error("Error uploading file:", error);
        });
    }

    const deleteCard = (titleCard) => {
      axios.post("http://127.0.0.1:8000/api/deleteFlashCard/", {"title": titleCard, "thread": selectedThread})
      .then((response) => {
        setFlashCards(flashCards.filter(card => card.title !== titleCard));
      })
      .catch((error) => {
          console.error("Error uploading file:", error);
      });
    }

    

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

        axios.get('http://127.0.0.1:8000/api/getThreads/')
        .then((response) => {
            setThreads(response.data["threads"]);
        })
        .catch((error) => {
            console.error("Error uploading file:", error);
        })
    }, [])


    const handleQuery = () => {
      setResponse(''); // clear old response
      setLoading(true);
      const eventSource = new EventSource('http://localhost:8000/api/chatStream/' + '?query=' + query + '&model=' + selectedModel + '&thread=' + selectedThread);
    
      eventSource.onmessage = function(event) {
          if (event.data === "[DONE]") {
              eventSource.close();
              console.log("DONE!!");
              setLoading(false);
              return;
          }
          setResponse(prev => prev + event.data);
      };
    
      eventSource.onerror = function(err) {
          console.error('EventSource failed:', err);
          // setReadToQuery(false)
          setLoading(false);
          eventSource.close();
      };
    
      return () => {
          setLoading(false);
          eventSource.close();
      };
  };


    const handleCreateFlashCards = () => {
      setLoading(true);
      axios.post('http://127.0.0.1:8000/api/createFlashCards/', {"query": query, "model": selectedModel, "thread": selectedThread}).
      then((response) => {
        setLoading(false);
        let newCards = [...flashCards, ...response.data["cards"]];
        setFlashCards(newCards);
      })
      .catch((error) => {
          setLoading(false);
          console.error("Error uploading file:", error);
      })
    }

    const handleCreateQuiz = () => {
      setLoading(true);
      axios.post('http://127.0.0.1:8000/api/createQuiz/', {"query": query, "model": selectedModel, "thread": selectedThread}).
      then((response) => {
        setLoading(false);
      })
      .catch((error) => {
          setLoading(false);
          console.error("Error uploading file:", error);
      })
      
    }

    useEffect(() => {
        if(selectedThread !== ""){
          axios.get('http://127.0.0.1:8000/api/getFlashCards/' + '?thread=' + selectedThread).
          then((response) => {
            setFlashCards(response.data["cards"]);
          })
          .catch((error) => {
              console.error("Error uploading file:", error);
          })
        }

    }, [selectedThread]);

    useEffect(() => {
      console.log(flashCards)
    }, [flashCards])
    

    const handleRadioChange = (event) => {
      setInputType(event.target.value);
  };

    return (
      <div >
        <Paper 
        elevation={3}
        sx={{
          padding: 3,
          backgroundColor: '#f9fafb',
          borderRadius: 4,
          boxShadow: '0px 4px 20px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0',
        }}>

            <Typography variant="h4" sx={{fontWeight: "bold", marginBottom: "1em", textAlign: "center"}}>
              <Box sx={{cursor: "pointer"}} component={"span"} onClick={() => window.location.reload()}>
                <img src="http://127.0.0.1:8000/static/images/Logo.png" height={"80em"} style={{position: "relative", top: "0.2em"}}/>
                AI Study Companion
              </Box>
            </Typography>

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
            <Divider />
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
            <Box>
              <input
                accept="*"
                type="file"
                id="file-upload"
                style={{ display: "none" }}
                onChange={handleFileChange}
                component="span"
                required
              />
              <label htmlFor="file-upload">
                <Button variant="contained" component="span">
                  Upload File
                </Button>
              </label>
              <Typography variant="body2" sx={{mt: "0.5em", overflow: "auto"}}><span style={{textDecoration: "underline"}}>Selected file</span>: {file ? file.name : "No file selected" }</Typography>
            </Box>
            }
            {inputType === "url" && 
            <>
              <TextField
                label="Enter Youtube URL"
                variant="outlined"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                fullWidth
                required
              />
            </>
            }
            <Button variant="contained" component="span" onClick={handleSubmitFile} sx={{mt: "1em"}}>
                Submit {(inputType === "file") ? "File" : "Youtube URL"}
            </Button>
            <Typography variant="caption" sx={{display: "block", color: colorOfResponse, height: "0.5em", my:"0.2em"}}>{errorResponse}</Typography> 

            <Divider sx={{mt: "1em"}}/>


            <Box display="flex" flexDirection="column" gap={1} width={300}>
              <Box>
                <BasicModalAdd  threads={threads} setThreads={setThreads} />
                <BasicModalDelete  threads={threads} setThreads={setThreads} />
              </Box>
              {/* Dropdown to select thread */}
              <TextField
                select
                label="Select a Thread"
                value={selectedThread}
                onChange={handleSelectChange}
                fullWidth
              >
                {threads.map((thread, index) => (
                  <MenuItem key={index} value={thread}>
                    {thread}
                  </MenuItem>
                ))}
              </TextField>
              
              
            </Box>

            <FormControl sx={{mt: "1em"}}>
              <FormLabel>Choose Execution Type</FormLabel>
              <RadioGroup
                row
                value={executionType}
                onChange={handleExecuteQuery}
              >
                <FormControlLabel value="Explain simply" control={<Radio />} label="Explain Simply" />
                <FormControlLabel value="Create flash cards" control={<Radio />} label="Create flash cards" />
                <FormControlLabel value="Create quiz" control={<Radio />} label="Create quiz" />
              </RadioGroup>
            </FormControl>
            <TextField
              label="Enter Prompt"
              variant="outlined"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              sx={{my: "1em"}}
              fullWidth
              required
            />
            <Button variant="contained" 
            onClick={(executionType === "Explain simply") ? handleQuery : (executionType === "Create flash cards") ? handleCreateFlashCards : handleCreateQuiz} 
            disabled={readToQuery === false || selectedThread === ""}>
                Submit Prompt
            </Button>
            <IconButton>
              {(loading) ? <CircularProgress size={24} /> : ""}
            </IconButton>
            {/* <Typography variant="h5" sx={{fontWeight: "bold"}}>{response}</Typography> */}
        </Paper>
        {response && executionType === "Explain simply" &&
          <Paper 
          sx={{
            padding: 3,
            backgroundColor: '#f9fafb',
            borderRadius: 4,
            border: '1px solid #e0e0e0',
            mt: "1em",
            maxHeight: "20em",
            whiteSpace: "pre-line",
            overflow: "auto"
          }}
          >
            <Typography variant="h5" sx={{fontWeight: "bold", color: "green"}}> Response</Typography>
            <Typography variant="h6" sx={{fontWeight: "500"}}>{response}</Typography>
          </Paper>
        }
        {selectedThread !== "" && executionType === "Create flash cards" && flashCards != [] &&
          <Paper 
          sx={{
            padding: 3,
            backgroundColor: '#f9fafb',
            borderRadius: 4,
            border: '1px solid #e0e0e0',
            mt: "1em",
            maxHeight: "20em",
            whiteSpace: "pre-line",
            overflow: "auto"
          }}
          >
            <Typography variant="h5" sx={{fontWeight: "bold", color: "green", my: "1em", textAlign: "center"}}>Flash Cards</Typography>
            {flashCards.map((card, index) => (
              <Paper key={index} sx={{ p: 2, mb: 2, display: "inline-block", mx: 1}}>
                <Typography variant="h6" sx={{ fontWeight: "500" }} component={"span"}>
                  {card["title"]}
                </Typography>
                <IconButton onClick={() => deleteCard(card["title"])}>
                  <DeleteIcon />
                </IconButton>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body1" sx={{ fontWeight: "400" }}>
                  {card["content"]}
                </Typography>
              </Paper>
            ))}
          </Paper>
        }
        </div>
    );
};

export default MainApp;