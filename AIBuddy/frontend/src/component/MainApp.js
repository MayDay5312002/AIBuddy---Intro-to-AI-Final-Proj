import React from "react";
import { useState, useEffect, useRef } from "react";
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
import ModalPresentQuiz from "../sub-component/ModalPresentQuiz.js";
import ModalPresentFlashcards from "../sub-component/ModalPresentFlashcards.js";

import axios from "axios";

const MainApp = () => {
    const [file, setFile] = useState(null);
    // const [folder, setFolder] = useState(""); 
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
    const [errorResponseMsg, setErrorResponseMsg] = useState(""); //for when generating response
    const [indexQuizSelected , setIndexQuizSelected] = useState(-1);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const [refreshMessageHistory, setRefreshMessageHistory] = useState(false);

    const paperRefResponse = useRef(null);
    const paperRefFlashCards = useRef(null);
    const paperRefQuizzes = useRef(null);

    const [newQuizzes, setNewQuizzes] = useState(false);
    const [newFlashCards, setNewFlashCards] = useState(false);


    const [autoScroll, setAutoScroll] = useState(true);

    const [isPortrait, setIsPortrait] = useState(window.matchMedia("(orientation: portrait)").matches);

    const submitButtonRef = useRef(null);

    const handleChoiceClick = (choice, answer, index) => {
      if(selectedAnswer === choice && indexQuizSelected === index){
        setSelectedAnswer('');
        setIsAnswerCorrect(null);
      }
      else{
        setSelectedAnswer(choice);
        setIsAnswerCorrect(choice === answer); // Check if selected answer is correct
        setIndexQuizSelected(index);
        console.log("selectedAnswer:", selectedAnswer, "answer:", answer, "index:", indexQuizSelected);
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
    




    const deleteCard = (titleCard, contentCard, id) => {
      axios.post("http://127.0.0.1:4192/api/deleteFlashCard/", {"title": titleCard, "thread": selectedThread, "contentCard": contentCard, "id": id})
      .then((response) => {
        setFlashCards(flashCards.filter(card => card.id !== id));
        setErrorResponseMsg("");
      })
      .catch((error) => {
          setErrorResponseMsg("Error: " + error.message);
          // console.error("Error uploading file:", error);
      });
    }

    const deleteQuiz = (question, id) => {
      axios.post("http://127.0.0.1:4192/api/deleteQuiz/", {"question": question, "thread": selectedThread, "id": id})
      .then((response) => {
        setQuizzes(quizzes.filter(quiz => quiz.id !== id));
        setErrorResponseMsg("");
      })
      .catch((error) => {
        setErrorResponseMsg("Error: " + error.message);
        // console.error("Error uploading file:", error);
      })
    }

    

    


    const handleQuery = () => {
      setErrorResponseMsg('');//clear old error
      setResponse(''); // clear old response
      setLoading(true);
      const eventSource = new EventSource('http://localhost:4192/api/chatStream/' + '?query=' + query + '&model=' + selectedModel + '&thread=' + selectedThread + "&executionType=" + executionType);
      paperRefResponse.current.scrollTop = paperRefResponse.current.scrollHeight;
      eventSource.onmessage = function(event) {
        // console.log('chunk:', JSON.stringify(event.data));
          // console.log(String(event.data), String(event.data).startsWith('{"error":'));
          if (event.data === "[DONE]") {
              eventSource.close();
              // console.log("DONE!!");
              setLoading(false);
              setRefreshMessageHistory(!refreshMessageHistory);
              setErrorResponseMsg("");
              return;
          }
          if(String(event.data).startsWith('{"error":')){
            setErrorResponseMsg("Error: " + JSON.parse(event.data).error);
            eventSource.close();
            setLoading(false);
            setRefreshMessageHistory(!refreshMessageHistory);
            // setErrorResponseMsg("");
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
      setNewFlashCards(true);
      setFlashCards(response.data["cards"]);
      
    } catch (error) {
      // console.error("Error creating flashcards:", error);
      setErrorResponseMsg("Error: " + error.response.data["error"]);
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
        setNewQuizzes(true);
        setQuizzes(getResponse.data["quizzes"]);
        // paperRefQuizzes.current.scrollTo({
        //   top: paperRefQuizzes.current.scrollHeight,
        //   behavior: 'smooth'
        // });
      } catch (error) {
        // console.error("Error creating flashcards:", error);
        setErrorResponseMsg("Error: " + error.response.data["error"]);
      }
      setLoading(false);
    };

    const handleRadioChange = (event) => {
      // setReadyToQuery(false);
      setInputType(event.target.value);
    };

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

    const handleSubmitFolder = () => {
      setErrorResponse(<CircularProgress size={20} />);
      axios.get('http://127.0.0.1:4192/api/uploadFolder/')
      .then((response) => {
        setColorOfResponse("green");
        if(response.data["message"] === "Already running"){
          setErrorResponse("Already running");
        } else {
          setErrorResponse("Success");
        }
        
        // setFolder(response.data["folderPath"]);
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

    const handleScroll = () => {
       if (!paperRefResponse.current) return;
       const { scrollTop, scrollHeight, clientHeight } = paperRefResponse.current;

       // If the user scrolls up (not at bottom), turn off autoScroll.
       // You might add a tolerance (e.g., 20px) for accidental movements.
       if (scrollTop + clientHeight < scrollHeight - 5) {
         setAutoScroll(false);
       } else {
         setAutoScroll(true);
       }
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

    


    // useEffect(() => {// auto scroll
    // function onScroll() {
    //     const scrollPosition = window.innerHeight + window.pageYOffset; // window.pageYOffset =  number of pixels the document has been scrolled vertically from the top.
    //                                                                     // window.innerHeight = height of the visible viewport
    //     const bottomPosition = document.documentElement.scrollHeight; //gets the full height of the page
    //     const distanceFromBottom = bottomPosition - scrollPosition;

    //     if (distanceFromBottom < 100) {
    //       // User is near bottom, enable auto-scroll
    //       setAutoScrollEnabled(true);
    //     } else {
    //       // User scrolled up, disable auto-scroll
    //       setAutoScrollEnabled(false);
    //     }
    //   }

    //   window.addEventListener("scroll", onScroll);
    //   return () => window.removeEventListener("scroll", onScroll);
    // }, []);
    
    useEffect(() => {
        axios.get('http://127.0.0.1:4192/api/models/')
        .then((response) => {
            // console.log(response)
            setModels(response.data["models"])
            setSelectedModel(response.data["models"][0])
        })
        .catch((error) => {
            setErrorResponseMsg("Error: " + error.response.data["message"]);
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

    useEffect(() => {
      if (autoScroll && paperRefResponse.current) {
        
        paperRefResponse.current.scrollTop = paperRefResponse.current.scrollHeight;
        // paperRefResponse.current.scrollTo({
        //   top: paperRefResponse.current.scrollHeight,
        //   behavior: 'smooth'
        // });
      }
    }, [response, autoScroll]);

    // useEffect(() => {
    //   if (response && autoScrollEnabled) {
    //     window.scrollTo({
    //       top: document.documentElement.scrollHeight,
    //       behavior: "smooth",//optional for smooth scrolling
    //     });
    //   }
    // }, [response, autoScrollEnabled]);




    // useEffect(() => {
    //   console.log(JSON.stringify(response));
    // }, [response])

    

    useEffect(() => {
      // console.log("inputType", inputType);
      // setErrorResponse("");
      if(executionType === "Create flash cards" || executionType === "Create quiz"){
        // setReadyToQuery(false);
        if ((inputType === "model" || inputType === "web search")) {
          setErrorResponse("");
          // console.log("model or web search");
          setReadyToQuery(true);
        } else if (inputType === "Kiwix" && folderPath !== "") {
          setReadyToQuery(true);
          // setErrorResponse("");
        } 
        else if((inputType === "file" || inputType === "url") && vectorStoreContent !== ""){ 
          setReadyToQuery(true);
          // setErrorResponse("");
        }
        else {
          setReadyToQuery(false);
          setErrorResponse("");
        }
      }

      // Never log readyToQuery right after setReadyToQuery (it won't be updated yet)
    }, [inputType, folderPath, executionType]);

    useEffect(() => {
      if((inputType === "file" || inputType === "url") && vectorStoreContent === "") {
          setErrorResponse("");
      }
       if((inputType === "file" || inputType === "url") && vectorStoreContent !== "") {
          setErrorResponse("Success");
      }
      else if (inputType === "Kiwix" && folderPath === "") {
          setErrorResponse("");
      }
      else if (inputType === "Kiwix" && folderPath !== "") {
          setErrorResponse("Success");
      }
      else{
          setErrorResponse("");
      }
    }, [inputType]);
    


    useEffect(() => {
      setSelectedAnswer('');
      setIsAnswerCorrect(null);
      // setErrorResponse("");
      // console.log("executionType", executionType);
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

    useEffect(() => {
      if(executionType == "Explain with Kiwix" && folderPath === "") {
        setErrorResponse("");
      }
      else if (executionType == "Explain with Kiwix" && folderPath !== "") {
        setErrorResponse("Success");
      }
      else if (executionType == "Explain with document" && vectorStoreContent === "") {
        setErrorResponse("");
      }
      else if (executionType == "Explain with document" && vectorStoreContent !== "") {
        setErrorResponse("Success");
      }

      axios.get('http://127.0.0.1:4192/api/models/')
      .then((response) => {
          // console.log(response)
          setModels(response.data["models"])
          setSelectedModel(response.data["models"][0])
      })
      .catch((error) => {
          setErrorResponseMsg("Error: " + error.response.data["message"]);
          // console.error("Error uploading file:", error);
      })

      // executionType === "Explain with Document" ? setInputType("file") : null;
      if (executionType === "Explain with document" && (inputType !== "file" && inputType !== "url")) {//////////////////////////////////////FIX THISS
        setInputType("file");
      }

      
    }, [executionType]);

    useEffect(() => {
      if (flashCards.length && paperRefFlashCards.current && newFlashCards) {
        paperRefFlashCards.current.scrollTo({
          top: paperRefFlashCards.current.scrollHeight,
          behavior: 'smooth'
        });
        setNewFlashCards(false);
      }
    }, [newFlashCards, flashCards]);

    useEffect (() => {
      if (quizzes.length && paperRefQuizzes.current && newQuizzes) {
        paperRefQuizzes.current.scrollTo({
          top: paperRefQuizzes.current.scrollHeight,
          behavior: 'smooth'
        });
        setNewQuizzes(false);
      }
    }, [newQuizzes, quizzes]);



    useEffect(() => {
      // console.log("readyToQuery", readyToQuery);
    }, [readyToQuery])
    

    return (
      <div style={{display: "flex", flexDirection: "column", height: "100%"}}>
        {/* <Box sx={{display: "flex", justifyContent: "center", alignItems: "center"}}> */}
        <Box >
          <Typography variant="h4" sx={{fontWeight: "bold", textAlign: "center", fontSize: "2em", color: "#383838ff"}}>
            <Box sx={{cursor: "pointer" }} component={"span"} onClick={() => window.location.reload()}>
              <img src="http://127.0.0.1:4192/static/images/Logo.png"  style={{position: "relative", top: "0.2rem", height: "2.3em"}}/>
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
            minWidth: isPortrait ? undefined : "25.5em",
            minHeight: isPortrait ? "15em" : undefined,
            height: isPortrait ? "15em" : undefined,
            maxHeight: isPortrait ? "15em" : undefined,


          }}>

              {/* <Typography variant="h4" sx={{fontWeight: "bold", marginBottom: "1em", textAlign: "center"}}>
                <Box sx={{cursor: "pointer"}} component={"span"} onClick={() => window.location.reload()}>
                  <img src="http://127.0.0.1:4192/static/images/Logo.png" height={"80em"} style={{position: "relative", top: "0.2em"}}/>
                  AI Study Companion
                </Box>
              </Typography> */}
              {executionType !== "Explain with web search"  && executionType !== "Explain Simply" && executionType !== "Explain with Kiwix" &&
              <>
              <FormControl sx={{width: "100%"}}>
                <FormLabel>Choose Input Type</FormLabel>
                <RadioGroup
                  // row
                  value={inputType}
                  onChange={handleRadioChange}
                  id="inputType-radio-buttons-group"
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    width: "21em",
                    // gap: 1, // optional spacing between items
                  }}
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

              <Typography id="error-response-text" variant="caption" sx={{display: "block", color: colorOfResponse, minHeight: "2.3em", mt:"0.5em"}}>{errorResponse}</Typography> 


              { ((inputType !== "model" && inputType !== "web search") || executionType === "Explain with Kiwix") &&
              <Box>
                <Divider/>
                

                <Typography variant="body2" sx={{ my: "1em"}}> {/*///////////////////////////////////////////////////////*/}
                  {executionType !== "Explain with Kiwix" && inputType !== "Kiwix"? "Vector Store Content" : "Kiwix Folder"}: {(vectorStoreContent.includes("youtu.be") || vectorStoreContent.includes("youtube.com")) ? 
                  <a href={vectorStoreContent}>{vectorStoreContent}</a> : (executionType === "Explain with Kiwix" || inputType === "Kiwix" ? folderPath : vectorStoreContent)}
                </Typography>

              <Divider sx={{mt: "1em"}}/> 
              </Box>
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
          <Paper sx={{p:"1em", borderRadius: 4, top: 0, mx: "1em", flexGrow: 6, overflow: "auto", position: "relative", display: "flex", flexDirection: "column"}}>
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
              <TextField //################input for query#################
                label="Enter Prompt"
                variant="outlined"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                sx={{ 
                  my: "1em",
                  '& .MuiInputBase-input': {
                    resize: "vertical",
                    maxHeight: 110 // enforce max height for 4 rows
                  }
                }}
                fullWidth
                required
                multiline
                // rows={1}
                minRows={1}
                maxRows={4}
                inputProps={{
                  style: { resize: "vertical", overflow: "auto" }
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    // console.log("submit button disabled", submitButtonRef.current.disabled);     
                    if(submitButtonRef.current.disabled === false){
                      // (executionType === "Explain with document") ? handleQuery() : (executionType === "Create flash cards") ? handleCreateFlashCards() : handleCreateQuiz()
                      if (executionType === "Explain with document" || executionType === "Explain with Kiwix" || executionType === "Explain with web search" || executionType === "Explain Simply") {
                        handleQuery()
                      } else if (executionType === "Create flash cards") {
                        handleCreateFlashCards()
                      } else if (executionType === "Create quiz") {
                        handleCreateQuiz()
                      }
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
                  ref={submitButtonRef}
                  sx={{fontSize: "0.85rem"}}
                  variant="contained" 
                  type="submit"
                  onClick={
                    (executionType === "Explain with document" || executionType === "Explain with Kiwix" || executionType === "Explain with web search" || executionType === "Explain Simply") 
                    ? 
                    handleQuery 
                    : 
                    (executionType === "Create flash cards" ? handleCreateFlashCards : handleCreateQuiz)
                  } 
                  disabled={readyToQuery === false || selectedThread === "" || query === "" || loading || selectedModel === ""}>
                      Submit Prompt
                  </Button>
                  <IconButton>
                    {(loading) ? <CircularProgress size={24} /> : ""}
                  </IconButton>
                  <Typography variant="caption" sx={{display: "block", fontStyle: "italic"}}>Note: Please ensure Thread and File/URL are set to submit prompt.</Typography>
                  <Typography variant="body2" sx={{display: "block", color: "red", minHeight: "1.5em", fontSize:"0.8rem", mb: "0.1em"}}>{errorResponseMsg}</Typography>
                  <Divider sx={{mb: "0.5em"}}/>
                </Box>
                }

                  {selectedThread !== "" && (executionType === "Explain with document" || executionType === "Explain with Kiwix" || 
                    executionType === "Explain with web search" || executionType === "Explain Simply") &&
                    <Paper 
                    ref={paperRefResponse}
                    onScroll={handleScroll}
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
                        {response}
                      </Typography>


                    </Paper>
                
                  }
                  {selectedThread !== "" && executionType === "Create flash cards" && flashCards != [] &&
                    <Paper 
                    ref={paperRefFlashCards}
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
                      <Box sx={{display: 'flex', justifyContent: 'center', alignItems: "center", columnGap: "0.5em", my: "0.5em"}}>
                        <ModalAddFlashCard setFlashCards={setFlashCards} thread_title={selectedThread} setNewFlashCards={setNewFlashCards}/>
                        <ModalPresentFlashcards flashcards={flashCards} />
                      </Box>
                      {flashCards.map((card, index) => (
                        <Paper key={card.id} sx={{ p: 2, mb: 2, display: "inline-block", mx: 1, maxWidth: "30em"}}>
                          <Typography variant="h6" sx={{ fontWeight: "500" }} component={"span"}>
                            {card["title"]}
                          </Typography>
                          <IconButton onClick={() => deleteCard(card["title"], card["content"], card["id"])} sx={{mx: 1}}>
                            <DeleteIcon />
                          </IconButton>
                          <ModalChangeFlashCard oldTitle={card["title"]}  oldContent={card["content"]} setFlashCards={setFlashCards} 
                          flashCards={flashCards} thread_title={selectedThread} id_card={card["id"]}/>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="body1" sx={{ fontWeight: "400", whiteSpace: "pre-line"}}>
                            {card["content"]}
                          </Typography>
                      
                        </Paper>
                      ))}
                    </Paper>
                  }
                  {selectedThread !== "" && executionType === "Create quiz" && quizzes != [] &&
                    <Paper 
                    ref={paperRefQuizzes}
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
                      <Box sx={{display: 'flex', justifyContent: 'center', my: "0.5em", alignItems: "center", columnGap: "0.5em"}}>
                        <ModalAddQuiz setQuizzes={setQuizzes} thread_title={selectedThread} setNewQuizzes={setNewQuizzes}/>
                        <ModalPresentQuiz quizzes={quizzes} />
                      </Box>
                      {quizzes.map((quiz, indexQuiz) => (
                        <Paper key={quiz.id} sx={{ p: 2, mb: 2, display: "inline-block", mx: 1}}>
                          <Typography variant="h6" sx={{ fontWeight: "500" }} component={"span"}>
                            {quiz["question"]}
                          </Typography>
                          <IconButton onClick={() => deleteQuiz(quiz["question"], quiz["id"])} sx={{mx: 1}}>
                            <DeleteIcon />
                          </IconButton>
                          <ModalChangeQuiz oldAnswer={quiz.answer} oldQuestion={quiz.question} oldChoices={quiz.choices} 
                          setQuizzes={setQuizzes} quizzes={quizzes} thread_title={selectedThread} id_quiz={quiz.id}
                          indexQuizSelected={indexQuizSelected} handleChoiceClick={handleChoiceClick} selectedAnswer={selectedAnswer} />
                          <Divider sx={{ my: 1 }} />
                          <List>
                            {quiz.choices.map((choice, index) => (
                              <ListItem
                                key={index}
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
                                    backgroundColor: selectedAnswer === choice && indexQuizSelected === indexQuiz
                                      ? isAnswerCorrect
                                        ? '#2eb774'
                                        : '#eb5353'
                                      : 'lightgray',
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