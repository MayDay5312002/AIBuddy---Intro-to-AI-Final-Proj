import React from "react";
import { useState, useEffect } from "react";
import { Button, TextField, Typography, Select, MenuItem, FormControl, 
  InputLabel, Box, Radio, RadioGroup, FormControlLabel, FormLabel, Paper, Divider, IconButton, 
  CircularProgress, List,
  ListItem, ListItemText,
  Modal} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';


import ModalAddThread from "../sub-component/ModalAddThread.js";
import ModalDeleteThread from "../sub-component/ModalDeleteThread.js";
import ModalChangeFlashCard from "../sub-component/ModalChangeFlashCard.js";
import ModalChangeQuiz from "../sub-component/ModalChangeQuiz.js";
import ModalAddFlashCard from "../sub-component/ModalAddFlashCard.js";
import ModalAddQuiz from "../sub-component/ModalAddQuiz.js";
import ModalModifyMessegeHistory from "../sub-component/ModalModifyMessegeHistory.js";

import axios from "axios";

const MainApp = () => {
    const [file, setFile] = useState(null);
    const [folder, setFolder] = useState(""); 
    const [url, setUrl] = useState("");
    const [query, setQuery] = useState("");
    const [response, setResponse] = useState("");
    const [models, setModels] = useState([])
    const [readyToQuery, setReadyToQuery] = useState(false);
    const [inputType, setInputType] = useState("file");
    const [errorResponse, setErrorResponse] = useState("");
    const [colorOfResponse, setColorOfResponse] = useState("red");
    const [executionType, setExecutionType] = useState("Explain Simply");

    const [threads, setThreads] = useState([]);
    const [selectedThread, setSelectedThread] = useState('');


    const [flashCards, setFlashCards] = useState([]);
    const [quizzes, setQuizzes] = useState([]);

    const [loading, setLoading] = useState(false);

    const [selectedModel, setSelectedModel] = useState("");


    const [numberEx, setNumberEx] = useState(1);

    const [vectorStoreContent, setVectorStoreContent] = useState("");
    const [folderPath, setFolderPath] = useState("");


    const [selectedAnswer, setSelectedAnswer] = useState('');
    const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);
    const [autoScrollEnabled, setAutoScrollEnabled] = useState(true); //State to control auto-scroll
    const [errorResponseMsg, setErrorResponseMsg] = useState(""); //for when generating response
    const [indexQuizSelected , setIndexQuizSelected] = useState(-1);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const [refreshMessageHistory, setRefreshMessageHistory] = useState(false);

    const [isPortrait, setIsPortrait] = useState(window.matchMedia("(orientation: portrait)").matches);

    const handleChoiceClick = (choice, answer, index) => {
      if(selectedAnswer === choice){
        setSelectedAnswer('');
        setIsAnswerCorrect(null);
      }
      else{
        setSelectedAnswer(choice);
        setIsAnswerCorrect(choice === answer); // Check if selected answer is correct
        setIndexQuizSelected(index);
      }
    };

    const toggleFullscreen = () => {
      setIsFullscreen(!isFullscreen);
    };


    

    const handleSelectedChange = (event) => {
      setSelectedModel(event.target.value);
    };

    const handleExecuteQuery = (event) => {
      setExecutionType(event.target.value);
    }

    const handleSelectChange = (event) => {
      setSelectedThread(event.target.value);
    };

    const handleChangeExcutionType = (e) => {
      const val = e.target.value;
  
      if (/^\d*$/.test(val)) {
        setNumberEx(val === "" ? 0 : parseInt(val, 10));
      }
    };

    
  

    const handleFileChange = (event) => {
        const fileTemp = event.target.files[0];
        if (fileTemp) {
          // console.log("Selected file:", file.name);
          setFile(fileTemp)
          // console.log(file)
          // You can now upload or process the file
        }
    };

    useEffect(() => {
      if(!threads.includes(selectedThread)){
        setSelectedThread("")
      }
    }, [threads])

    useEffect(() => {
      setIsPortrait(window.matchMedia("(orientation: portrait)").matches);
    }, [window.innerHeight, window.innerWidth])
    



    const handleSubmitFile = () => {
        setErrorResponse("");
        setErrorResponseMsg('');//clear old error
        setErrorResponse(<CircularProgress size={18} />)
        setVectorStoreContent("");
        const formData = new FormData();
        if(inputType === "file"){
          if(file===null){
            setColorOfResponse("red")
            setErrorResponse("Please select a file")
            setReadyToQuery(false)
            return
          }
          formData.append("file", file);
        }
        else if(inputType === "url"){
          if(url===""){
            setColorOfResponse("red")
            setErrorResponse("Please enter a url")
            setReadyToQuery(false)
            return
          }
          formData.append("url", url);
        }
        // formData.append("url", url);
        axios.post("http://127.0.0.1:4192/api/fileUpload/", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            }
        })
        .then((response) => {
            // console.log(response)
            // setResponse(response.data["msg"])
            
            if(inputType === "file"){
              setVectorStoreContent(file.name)
            }
            else if(inputType === "url"){
              setVectorStoreContent(url)
            }
            setColorOfResponse("green")
            setErrorResponse("Success")
            setReadyToQuery(true);

        })
        .catch((error) => {
            setColorOfResponse("red")
            setErrorResponse("Error")
            // console.error("Error uploading file:", error);
        });
    }

    const deleteCard = (titleCard) => {
      // if(loading){
      //   setErrorResponseMsg("Warning: Cannot delete while generating response");
      //   return;
      // }
      axios.post("http://127.0.0.1:4192/api/deleteFlashCard/", {"title": titleCard, "thread": selectedThread})
      .then((response) => {
        
        setFlashCards(flashCards.filter(card => card.title !== titleCard));
        setErrorResponseMsg("");
      })
      .catch((error) => {
          setErrorResponseMsg("Error: " + error.message);
          // console.error("Error uploading file:", error);
      });
    }

    const deleteQuiz = (question) => {
      axios.post("http://127.0.0.1:4192/api/deleteQuiz/", {"question": question, "thread": selectedThread})
      .then((response) => {
        setQuizzes(quizzes.filter(quiz => quiz.question !== question));
        setErrorResponseMsg("");
      })
      .catch((error) => {
        setErrorResponseMsg("Error: " + error.message);
        // console.error("Error uploading file:", error);
      })
    }

    

    useEffect(() => {
        axios.get('http://127.0.0.1:4192/api/models/')
        .then((response) => {
            // console.log(response)
            setModels(response.data["models"])
            setSelectedModel(response.data["models"][0])
        })
        .catch((error) => {
            setErrorResponseMsg("Error: " + error.message);
            // console.error("Error uploading file:", error);
        })

        axios.get('http://127.0.0.1:4192/api/getThreads/')
        .then((response) => {
            setThreads(response.data["threads"]);
        })
        .catch((error) => {
            setErrorResponseMsg("Error: " + error.message);
            // console.error("Error uploading file:", error);
        })

        // axios.get('http://127.0.0.1:4192/api/getQuizzes/' + '?thread=' + selectedThread)
    }, [])


    const handleQuery = () => {
      setErrorResponseMsg('');//clear old error
      setResponse(''); // clear old response
      setLoading(true);
      const eventSource = new EventSource('http://localhost:4192/api/chatStream/' + '?query=' + query + '&model=' + selectedModel + '&thread=' + selectedThread + "&executionType=" + executionType);
    
      eventSource.onmessage = function(event) {
        console.log('chunk:', JSON.stringify(event.data));

          if (event.data === "[DONE]") {
              eventSource.close();
              // console.log("DONE!!");
              setLoading(false);
              setRefreshMessageHistory(!refreshMessageHistory);
              setErrorResponseMsg("");
              return;
          }
          setResponse(prev => prev + event.data);
      };
    
      eventSource.onerror = function(err) {
          // console.error('EventSource failed:', err);
          // setReadyToQuery(false)
          setErrorResponseMsg("Error: " + err.message);
          setLoading(false);
          eventSource.close();
      };
    
      return () => {
          setLoading(false);
          eventSource.close();
      };
  };


    const handleCreateFlashCards = async () => {
    setLoading(true);
    try {
      await axios.post('http://127.0.0.1:4192/api/createFlashCards/', {
        query: query,
        model: selectedModel,
        thread: selectedThread,
        number: numberEx,
        inputType: inputType
      });
      setErrorResponseMsg("");
      const response = await axios.get('http://127.0.0.1:4192/api/getFlashCards/?thread=' + selectedThread);
      setFlashCards(response.data["cards"]);
    } catch (error) {
      setErrorResponseMsg("Error: " + error.message);
    }
    setLoading(false);
  }


    const handleCreateQuiz = async () => {
      setLoading(true);
      try {
        const postResponse = await axios.post(
          'http://127.0.0.1:4192/api/createQuiz/',
          {
            query: query,
            model: selectedModel,
            thread: selectedThread,
            number: numberEx,
            inputType: inputType
          }
        );
        // // Optional: update quizzes immediately from POST response
        // let newQuizzes = [...quizzes, ...postResponse.data["quizzes"]];
        // setQuizzes(newQuizzes);
        setErrorResponseMsg("");
      
        // Now fetch the latest quizzes from the backend
        const getResponse = await axios.get(
          'http://127.0.0.1:4192/api/getQuizzes/?thread=' + selectedThread
        );
        setQuizzes(getResponse.data["quizzes"]);
      } catch (error) {
        setErrorResponseMsg("Error: " + error.message);
      }
      setLoading(false);
    };


    useEffect(() => { //Get flashcards and quizzes for a selected thread
        setErrorResponseMsg('');//clear old error
        if(selectedThread !== ""){
          axios.get('http://127.0.0.1:4192/api/getFlashCards/' + '?thread=' + selectedThread).
          then((response) => {
            setFlashCards(response.data["cards"]);
          })
          .catch((error) => {
              // console.error("Error uploading file:", error);
          })

          axios.get('http://127.0.0.1:4192/api/getQuizzes/' + '?thread=' + selectedThread)
          .then((response) => {
            setQuizzes(response.data["quizzes"]);
          })
          .catch((error) => {
              // console.error("Error uploading file:", error);
          })
        }

    }, [selectedThread]);

    // useEffect(() => {
      // console.log(flashCards)
    // }, [flashCards])

    // useEffect(() => {
      // console.log("quizzes", quizzes)
    // }, [quizzes])
    

    const handleRadioChange = (event) => {
      // setReadyToQuery(false);
      setInputType(event.target.value);
    };

    useEffect(() => {// auto scroll
    function onScroll() {
        const scrollPosition = window.innerHeight + window.pageYOffset; // window.pageYOffset =  number of pixels the document has been scrolled vertically from the top.
                                                                        // window.innerHeight = height of the visible viewport
        const bottomPosition = document.documentElement.scrollHeight; //gets the full height of the page
        const distanceFromBottom = bottomPosition - scrollPosition;

        if (distanceFromBottom < 100) {
          // User is near bottom, enable auto-scroll
          setAutoScrollEnabled(true);
        } else {
          // User scrolled up, disable auto-scroll
          setAutoScrollEnabled(false);
        }
      }

      window.addEventListener("scroll", onScroll);
      return () => window.removeEventListener("scroll", onScroll);
    }, []);
    

    useEffect(() => {
      if (response && autoScrollEnabled) {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: "smooth",//optional for smooth scrolling
        });
      }
    }, [response, autoScrollEnabled]);



    const scrollToBottom = () => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth", // optional for smooth scrolling animation
      });
    };

    useEffect(() => {
      console.log(JSON.stringify(response));
    }, [response])

    const handleSubmitFolder = () => {
      setErrorResponse(<CircularProgress size={20} />);
      axios.get('http://127.0.0.1:4192/api/uploadFolder/')
      .then((response) => {
        setColorOfResponse("green");
        setErrorResponse("Success");
        setFolder(response.data["folderPath"]);
        setFolderPath(response.data["folderPath"]);
        setReadyToQuery(true);
      })
      .catch((error) => {
          // console.error("Error uploading file:", error);
          setColorOfResponse("red");
          setErrorResponse("Error: " + error.response.data["error"]);
          setFolderPath("");
          setReadyToQuery(false);
      })
    };

    useEffect(() => {
      console.log("inputType", inputType);
      setErrorResponse("");
      if(executionType === "Create flash cards" || executionType === "Create quiz"){
        // setReadyToQuery(false);
        if ((inputType === "model" || inputType === "web search")) {
          console.log("model or web search");
          setReadyToQuery(true);
        } else if (inputType === "Kiwix" && folderPath !== "") {
          setReadyToQuery(true);
        } 
        else if((inputType === "file" || inputType === "url") && vectorStoreContent !== ""){ 
          setReadyToQuery(true);
        }
        else {
          setReadyToQuery(false);
        }
      }

      // Never log readyToQuery right after setReadyToQuery (it won't be updated yet)
    }, [inputType, folderPath]);


    useEffect(() => {
      setSelectedAnswer('');
      setIsAnswerCorrect(null);
      setErrorResponse("");
      console.log("executionType", executionType);
      if(executionType !== "Create flash cards" && executionType !== "Create quiz"){
        if (executionType === "Explain with Kiwix") {
          // Only set true if folderPath is valid
          setReadyToQuery(folderPath !== "");
        } else if (executionType === "Explain with document") {
          // Only set true if vectorStoreContent is present
          setReadyToQuery(vectorStoreContent !== "");
        } else if (
          executionType === "Explain with web search" ||
          executionType === "Explain Simply"
        ) {
          setReadyToQuery(true);
        } else {
          setReadyToQuery(false);
        }
      }
    }, [executionType, folderPath, vectorStoreContent]);



    // useEffect(() => {
      
    //   console.log("Status: " + readyToQuery);
    // }, [readyToQuery])
    
    
    const lines = response.split('[br]');

    return (
      <div style={{display: "flex", flexDirection: "column", height: "100%"}}>
        {/* <Box sx={{display: "flex", justifyContent: "center", alignItems: "center"}}> */}
        <Box >
          <Typography variant="h4" sx={{fontWeight: "bold", textAlign: "center", fontSize: "4.1vh", color: "#383838ff"}}>
            <Box sx={{cursor: "pointer" }} component={"span"} onClick={() => window.location.reload()}>
              <img src="http://127.0.0.1:4192/static/images/Logo.png"  style={{position: "relative", top: "0.2rem", height: "9vh"}}/>
              <Typography
                variant="h4"
                sx={{
                  display: "inline",
                  fontWeight: "600",
                  fontSize: "4.1vh",
                  color: "#3a3838ff",
                  textShadow: `
                    -1px -1px 0 #ffffffff,  
                    1px -1px 0 #ffffffff,
                    -1px 1px 0 #ffffffff,
                    1px 1px 0 #ffffffff,
                    2px 2px 4px white
                  `,
                }}
              >
                AI Study Companion
              </Typography>

            </Box>
          </Typography>
        </Box>
        {/* <Divider sx={{margin: "1em", mx: "5em", fontSize: "0.6rem"}}/> */}
        <hr 
        style=
        {{
          margin: "1em 5em",
          fontSize: "0.6rem", 
          borderRadius: "10em", 
          borderWidth: "0.1em", 
          color: "#cfcfcfff",
          borderTopColor: "#8a8a8aff",
          borderBottomColor: 'rgb(194, 213, 219)',
          color: '#a5a5a5ff'
        }}
        />
        <Box
         sx={{display: "flex",
          flexDirection: isPortrait ? "column" : "row",
          overflow: "auto",
          // height: "86vh",
          // height: {xs: "60vh", sm: "70vh", md: "86vh"},
          pb: "0.75em",
          // flexGrow: "1"
          flex: "1"
          }}
        >
        { isFullscreen == false &&  
          <Paper 
          // elevation={3}
          sx={{
            padding: 3,
            borderRadius: 4,
            ml: "1em",
            mr: isPortrait ? "1em" : 0,
            mb: isPortrait ? "1em" : 0,  
            // order:1
            flexGrow: 3,
            overflow: "auto",
            minWidth: "20em",
            minHeight: isPortrait ? "25em" : 0,


          }}>

              {/* <Typography variant="h4" sx={{fontWeight: "bold", marginBottom: "1em", textAlign: "center"}}>
                <Box sx={{cursor: "pointer"}} component={"span"} onClick={() => window.location.reload()}>
                  <img src="http://127.0.0.1:4192/static/images/Logo.png" height={"80em"} style={{position: "relative", top: "0.2em"}}/>
                  AI Study Companion
                </Box>
              </Typography> */}
              {executionType !== "Explain with web search"  && executionType !== "Explain Simply" && executionType !== "Explain with Kiwix" &&
              <>
              <FormControl>
                <FormLabel>Choose Input Type</FormLabel>
                <RadioGroup
                  row
                  value={inputType}
                  onChange={handleRadioChange}
                >
                  <FormControlLabel value="file" control={<Radio />} label="Upload a File" />
                  <FormControlLabel value="url" control={<Radio />} label="Enter a youtube URL" />
                  { (executionType === "Create flash cards" || executionType === "Create quiz") &&
                    <>
                    <FormControlLabel value="model" control={<Radio />} label="Model independent" />
                    <FormControlLabel value="Kiwix" control={<Radio />} label="Upload Kiwix Folder" />
                    <FormControlLabel value="web search" control={<Radio />} label="Web Search" />
                    </>
                  }
                </RadioGroup>
              </FormControl>
              <Divider />
              </>
              }
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
            {(executionType !== "Explain with web search" && executionType !== "Explain Simply")  &&
              <>
              <Divider sx={{mb:"1em"}}/>
              {inputType === "file" && (executionType !== "Explain with Kiwix" && inputType !== "Kiwix") &&
              <Box>
                <Typography variant="h7" sx={{mb: "0.5em", display: "block", }}>Upload file</Typography>
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
                  <Button variant="contained" component="span" sx={{fontSize: "0.85rem"}}>
                    Select File
                  </Button>
                </label>
                <Typography variant="body2" sx={{mt: "0.5em", overflow: "auto"}}><span style={{textDecoration: "underline"}}>Selected file</span>: {file ? file.name : "No file selected" }</Typography>
              </Box>
              }
              {(inputType === "url" && (executionType !== "Explain with Kiwix" && inputType !== "Kiwix")) &&
              <>
                <Typography variant="h7" sx={{mb: "0.5em", display: "block"}}>Enter Youtube URL</Typography>
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
              {(executionType === "Explain with Kiwix" || (inputType === "Kiwix")) &&
                <>
                  <Typography variant="h7" sx={{mb: "0.5em", display: "block"}}>Upload Folder Path</Typography>
                  <Button variant="contained" component="span" sx={{fontSize: "0.85rem"}} onClick={handleSubmitFolder}>
                    Select Folder
                  </Button>
                {/* <Typography variant="body2" sx={{mt: "0.5em", overflow: "auto"}}><span style={{textDecoration: "underline"}}>Selected Folder</span>: {folder !== "" ? folder : "No folder selected" }</Typography> */}
                </> 
              }
              { (executionType !== "Explain with Kiwix" && inputType !== "Kiwix" && inputType !== "web search" && inputType !== "model") &&
                <Button variant="contained" component="span" onClick={handleSubmitFile} sx={{mt: "1em", fontSize: "0.85rem"}}>
                    Submit {(inputType === "file") ? "File" : "URL"}
                </Button>
              }
              <Typography variant="caption" sx={{display: "block", color: colorOfResponse, height: "0.5em", my:"0.5em"}}>{errorResponse}</Typography> 


              { ((inputType !== "model" && inputType !== "web search") || executionType === "Explain with Kiwix") &&
              <>
                <Divider sx={{mt: "1em"}}/>
                

                <Typography variant="body2" sx={{ my: "1em"}}> {/*///////////////////////////////////////////////////////*/}
                  {executionType !== "Explain with Kiwix" && inputType !== "Kiwix"? "Vector Store Content" : "Kiwix Folder"}: {(vectorStoreContent.includes("youtu.be") || vectorStoreContent.includes("youtube.com")) ? 
                  <a href={vectorStoreContent}>{vectorStoreContent}</a> : (executionType === "Explain with Kiwix" || inputType === "Kiwix" ? folderPath : vectorStoreContent)}
                </Typography>

              <Divider sx={{mt: "1em"}}/> 
              </>
              }

              </>
            }
              <Box display="flex" flexDirection="column" gap={1} width={300}>
                <Box>
                  <ModalAddThread  threads={threads} setThreads={setThreads} />
                  <ModalDeleteThread  threads={threads} setThreads={setThreads} />
                </Box>
                {/* Dropdown to select thread */}
                <TextField
                  select
                  label="Select a Thread"
                  value={selectedThread}
                  onChange={handleSelectChange}
                  fullWidth
                  sx={{mt: "0.5em"}}
                >
                  {threads.map((thread, index) => (
                    <MenuItem key={index} value={thread}>
                      {thread}
                    </MenuItem>
                  ))}
                </TextField>
                
                
              </Box>
              {/* <hr style={{width: "100%", border: "1px solid #e0e0e0", height: "0.1em"}}/> */}
              
          </Paper>
        } 
          <Paper sx={{p:"1em", borderRadius: 4, top: 0, mx: "1em", flexGrow: 5, overflow: "auto", position: "relative", display: "flex", flexDirection: "column"}}>
            {isFullscreen === false &&
            <Box>
              <FormControl sx={{mt: "0.2em"}}>
                <FormLabel>Choose Execution Type</FormLabel>
                <RadioGroup
                  row
                  value={executionType}
                  onChange={handleExecuteQuery}
                >
                  <FormControlLabel value="Explain Simply" control={<Radio />} label="Explain Simply" />
                  <FormControlLabel value="Explain with web search" control={<Radio />} label="Explain with web search" />
                  <FormControlLabel value="Explain with document" control={<Radio />} label="Explain with document" />
                  <FormControlLabel value="Explain with Kiwix" control={<Radio />} label="Explain with Kiwix" />
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
                multiline
                rows={1}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    // (executionType === "Explain with document") ? handleQuery() : (executionType === "Create flash cards") ? handleCreateFlashCards() : handleCreateQuiz()
                    if (executionType === "Explain with document" || executionType === "Explain with Kiwix" || executionType === "Explain with web search" || executionType === "Explain Simply") {
                      handleQuery()
                    } else if (executionType === "Create flash cards") {
                      handleCreateFlashCards()
                    } else if (executionType === "Create quiz") {
                      handleCreateQuiz()
                    }
                  }
                }}
              />
                  {(executionType !== "Explain with document" && executionType !== "Explain with Kiwix" && executionType !== "Explain with web search" && executionType !== "Explain Simply") &&
                  <Box>
                    <Typography variant="h7" sx={{fontWeight: 200, display: "block"}} >Number of {executionType === "Create flash cards" ? "flash cards" : "questions"} to generate:</Typography>
                    <TextField
                      type="number"
                      label="Enter a number"
                      value={numberEx}
                      onChange={handleChangeExcutionType}
                      inputProps={{
                        min: 1,
                        step: 1, // ensures stepping by whole numbers
                      }}
                      sx={{ width: 200, my: "1em" }}
                    /> 
                  </Box>
                  }
                  <Button 
                  sx={{fontSize: "0.85rem"}}
                  variant="contained" 
                  type="submit"
                  onClick={(executionType === "Explain with document" || executionType === "Explain with Kiwix" || executionType === "Explain with web search" || executionType === "Explain Simply") ? handleQuery : (executionType === "Create flash cards" ? handleCreateFlashCards : handleCreateQuiz)} 
                  disabled={readyToQuery === false || selectedThread === "" || query === "" || loading }>
                      Submit Prompt
                  </Button>
                  <IconButton>
                    {(loading) ? <CircularProgress size={24} /> : ""}
                  </IconButton>
                  <Typography variant="caption" sx={{display: "block",  height: "0.5em", my:"0.2em", fontStyle: "italic"}}>Note: Please ensure Thread and File/URL are set to submit prompt.</Typography>
                  <Typography variant="body2" sx={{display: "block", color: "red", height: "0.5em", my:"0.2em", fontSize:"0.8rem", my: "0.8em"}}>{errorResponseMsg}</Typography>
                  <Divider sx={{mb: "0.5em"}}/>
                </Box>
                }

                  {selectedThread !== "" && (executionType === "Explain with document" || executionType === "Explain with Kiwix" || 
                    executionType === "Explain with web search" || executionType === "Explain Simply") &&
                    <Paper 
                    sx={{
                      px: "3vh",
                      pt: "2vh",
                      backgroundColor: '#f9fafb',
                      borderRadius: "1em",
                      border: '1px solid #e0e0e0',
                      // mt: isFullscreen ? 0 : "1em",
                      // maxWidth: 
                      // height: isFullscreen ? "98vh" : {xs: "12em", sm: "13em", md: "23em"},
                      overflow: "auto",
                      position: "relative",
                      flex: "1",
                      minHeight: {xs: "20em", sm: "18em", md: "16em"},
                      pb: isFullscreen ? 0 : "0.75em"
                    }}
                    >
                      <IconButton
                        onClick={toggleFullscreen}
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                      >
                        {isFullscreen ? <FullscreenExitIcon/> : <FullscreenIcon />}
                      </IconButton>
                      <Typography variant="h5" sx={{fontWeight: "bold", color: "green", mt: "1em", textAlign: "center", color: "#0077b6"}}>Response</Typography>
                      <ModalModifyMessegeHistory thread_title={selectedThread} refreshMessageHistory={refreshMessageHistory} 
                      setRefreshMessageHistory={setRefreshMessageHistory} setResponse={setResponse}/>
                      <Typography variant="h6" sx={{ fontWeight: "500", whiteSpace: "pre-line"}}>
                        {/* {response.replace('[br]', '\n')} */}
                        {/* <span dangerouslySetInnerHTML={{ __html: response }} /> */}
                        {response}
                      </Typography>


                    </Paper>
                
                  }
                  {selectedThread !== "" && executionType === "Create flash cards" && flashCards != [] &&
                    <Paper 
                    sx={{
                      px: "3vh",
                      pt: "2vh",
                      backgroundColor: '#f9fafb',
                      borderRadius: "1em",
                      border: '1px solid #e0e0e0',
                      // mt: isFullscreen ? 0 : "1em",
                      // height: isFullscreen ? "98vh" : {xs: "12em", sm: "13em", md: "16em"},
                      // height: `calc(100vh - ${outerPaperHeight}px)`,
                      overflow: "auto",
                      position: "relative",
                      flex: "1",
                      minHeight: {xs: "20em", sm: "18em", md: "16em"},
                      pb: isFullscreen ? 0 : "0.75em"
                    }}
                    >
                      <IconButton
                        onClick={toggleFullscreen}
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                      >
                        {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                      </IconButton>
                      <Typography variant="h5" sx={{fontWeight: "bold", color: "green", mt: "1em", textAlign: "center", color: "#0077b6"}}>Flash Cards</Typography>
                      <ModalAddFlashCard setFlashCards={setFlashCards} flashCards={flashCards} thread_title={selectedThread}/>
                      {flashCards.map((card, index) => (
                        <Paper key={card.title} sx={{ p: 2, mb: 2, display: "inline-block", mx: 1, maxWidth: "30em"}}>
                          <Typography variant="h6" sx={{ fontWeight: "500" }} component={"span"}>
                            {card["title"]}
                          </Typography>
                          <IconButton onClick={() => deleteCard(card["title"])} sx={{mx: 1}}>
                            <DeleteIcon />
                          </IconButton>
                          <ModalChangeFlashCard oldTitle={card["title"]}  oldContent={card["content"]} setFlashCards={setFlashCards} flashCards={flashCards} thread_title={selectedThread}/>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="body1" sx={{ fontWeight: "400" }}>
                            {card["content"]}
                          </Typography>
                      
                        </Paper>
                      ))}
                    </Paper>
                  }
                  {selectedThread !== "" && executionType === "Create quiz" && quizzes != [] &&
                    <Paper 
                    sx={{
                      px: "3vh",
                      pt: "2vh",
                      backgroundColor: '#f9fafb',
                      borderRadius: "1em",
                      border: '1px solid #e0e0e0',
                      // mt: isFullscreen ? 0 : "1em",
                      // height: isFullscreen ? "98vh" : {xs: "12em", sm: "13em", md: "16em"},
                      // height: `calc(100vh - ${outerPaperHeight}px)`,
                      overflow: "auto",
                      position: "relative",
                      flex: "1",
                      minHeight: {xs: "20em", sm: "18em", md: "16em"},
                      pb: isFullscreen ? 0 : "0.75em"
                    }}
                    >
                      <IconButton
                        onClick={toggleFullscreen}
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                      >
                        {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                      </IconButton>
                      <Typography variant="h5" sx={{fontWeight: "bold", color: "green", mt: "1em", textAlign: "center", color:"#0077b6"}}>Quizzes</Typography>
                      {/* <Typography variant="h6" sx={{fontWeight: "500"}}>{response}</Typography> */}
                      <ModalAddQuiz setQuizzes={setQuizzes} quizzes={quizzes} thread_title={selectedThread}/>
                      {quizzes.map((quiz, indexQuiz) => (
                        <Paper key={quiz.question} sx={{ p: 2, mb: 2, display: "inline-block", mx: 1}}>
                          <Typography variant="h6" sx={{ fontWeight: "500" }} component={"span"}>
                            {quiz["question"]}
                          </Typography>
                          <IconButton onClick={() => deleteQuiz(quiz["question"])} sx={{mx: 1}}>
                            <DeleteIcon />
                          </IconButton>
                          <ModalChangeQuiz oldAnswer={quiz.answer} oldQuestion={quiz.question} oldChoices={quiz.choices} setQuizzes={setQuizzes} quizzes={quizzes} thread_title={selectedThread}/>
                          <Divider sx={{ my: 1 }} />
                          <List>
                            {quiz.choices.map((choice, index) => (
                              <ListItem
                                key={choice}
                                component={"button"}
                                onClick={() => handleChoiceClick(choice, quiz.answer, indexQuiz)}  
                                sx={{
                                  // Need to fix this. It shows color of the same choice(s) in diff questions
                                  backgroundColor:
                                    selectedAnswer === choice && indexQuizSelected === indexQuiz
                                      ? isAnswerCorrect
                                        ? 'lightgreen'
                                        : 'lightcoral'
                                      : 'transparent',
                                  borderRadius: 1,
                                  '&:hover': {
                                    backgroundColor: 'lightgray',
                                  },
                                  cursor: 'pointer',
                                }}
                              >
                                <ListItemText primary={choice} />
                              </ListItem>
                            ))}
                          </List>
                        </Paper>
                      ))}
                    </Paper>
                  }

          </Paper>
          </Box>

        
        </div>
    );
};

export default MainApp;