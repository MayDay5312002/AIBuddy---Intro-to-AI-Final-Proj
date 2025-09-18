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
    const [quizzes, setQuizzes] = useState([]);

    const [loading, setLoading] = useState(false);

    const [selectedModel, setSelectedModel] = useState("");


    const [numberEx, setNumberEx] = useState(1);

    const [vectorStoreContent, setVectorStoreContent] = useState("");


    const [selectedAnswer, setSelectedAnswer] = useState('');
    const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);
    const [autoScrollEnabled, setAutoScrollEnabled] = useState(true); //State to control auto-scroll
    const [errorResponseMsg, setErrorResponseMsg] = useState(""); //for when generating response
    const [indexQuizSelected , setIndexQuizSelected] = useState(-1);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const [refreshMessageHistory, setRefreshMessageHistory] = useState(false);

    const [isPortrait, setIsPortrait] = useState(1.25*window.innerWidth < window.innerHeight ? true : false);

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

    useEffect(() => {
      setSelectedAnswer('');
      setIsAnswerCorrect(null);
    }, [executionType])
  

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
      if(1.25*window.innerHeight < window.innerWidth){
        setIsPortrait(true)
      }
      else{
        setIsPortrait(false)
      }
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
            setReadToQuery(true);

        })
        .catch((error) => {
            setColorOfResponse("red")
            setErrorResponse("Error")
            // console.error("Error uploading file:", error);
        });
    }

    const deleteCard = (titleCard) => {
      axios.post("http://127.0.0.1:4192/api/deleteFlashCard/", {"title": titleCard, "thread": selectedThread})
      .then((response) => {
        setFlashCards(flashCards.filter(card => card.title !== titleCard));
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
      const eventSource = new EventSource('http://localhost:4192/api/chatStream/' + '?query=' + query + '&model=' + selectedModel + '&thread=' + selectedThread);
    
      eventSource.onmessage = function(event) {
          if (event.data === "[DONE]") {
              eventSource.close();
              // console.log("DONE!!");
              setLoading(false);
              setRefreshMessageHistory(!refreshMessageHistory);
              return;
          }
          setResponse(prev => prev + event.data);
      };
    
      eventSource.onerror = function(err) {
          // console.error('EventSource failed:', err);
          // setReadToQuery(false)
          setErrorResponseMsg("Error: " + err.message);
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
      axios.post('http://127.0.0.1:4192/api/createFlashCards/', {"query": query, "model": selectedModel, "thread": selectedThread, "number": numberEx}).
      then((response) => {
        setLoading(false);
        // console.log(response.data["cards"]);
        let newCards = [...flashCards, ...response.data["cards"]];
        setFlashCards(newCards);
        // scrollToBottom();
      })
      .catch((error) => {
          setLoading(false);
          setErrorResponseMsg("Error: " + error.message);
          // console.error("Error uploading file:", error);
      })
    }

    const handleCreateQuiz = () => {
      setLoading(true);
      axios.post('http://127.0.0.1:4192/api/createQuiz/', {"query": query, "model": selectedModel, "thread": selectedThread, "number": numberEx}).
      then((response) => {
        // console.log("quizzes type: ", typeof response.data["quizzes"], "quizzes: ", response.data["quizzes"]);
        let newQuizzes = [...quizzes, ...response.data["quizzes"]];
        setQuizzes(newQuizzes);
        setLoading(false);
        // scrollToBottom();
      })
      .catch((error) => {
          setLoading(false);
          setErrorResponseMsg("Error: " + error.message);
          // console.error("Error uploading file:", error);
      })
      
    }

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
      // setReadToQuery(false);
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

    return (
      <div style={{display: "flex", flexDirection: "column", height: "100%"}}>
        {/* <Box sx={{display: "flex", justifyContent: "center", alignItems: "center"}}> */}
        <Box >
          <Typography variant="h4" sx={{fontWeight: "bold", textAlign: "center", fontSize: "4.1vh", color: "#383838ff"}}>
            <Box sx={{cursor: "pointer", }} component={"span"} onClick={() => window.location.reload()}>
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
              <Divider sx={{mb:"1em"}}/>
              {inputType === "file" &&
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
                  <Button variant="contained" component="span">
                    Select File
                  </Button>
                </label>
                <Typography variant="body2" sx={{mt: "0.5em", overflow: "auto"}}><span style={{textDecoration: "underline"}}>Selected file</span>: {file ? file.name : "No file selected" }</Typography>
              </Box>
              }
              {inputType === "url" && 
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
              <Button variant="contained" component="span" onClick={handleSubmitFile} sx={{mt: "1em"}}>
                  Submit {(inputType === "file") ? "File" : "Youtube URL"}
              </Button>
              <Typography variant="caption" sx={{display: "block", color: colorOfResponse, height: "0.5em", my:"0.5em"}}>{errorResponse}</Typography> 

              <Divider sx={{mt: "1em"}}/>

              <Typography variant="body2" sx={{ my: "1em"}}> 
                Vector Store Content: {(vectorStoreContent.includes("youtu.be") || vectorStoreContent.includes("youtube.com")) ? <a href={vectorStoreContent}>{vectorStoreContent}</a> : vectorStoreContent}
              </Typography>

              <Divider sx={{mt: "1em"}}/> 
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
                multiline
                rows={1}
              />
                  {(executionType !== "Explain simply") &&
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
                  <Button variant="contained" 
                  onClick={(executionType === "Explain simply") ? handleQuery : (executionType === "Create flash cards") ? handleCreateFlashCards : handleCreateQuiz} 
                  disabled={readToQuery === false || selectedThread === "" || query === ""}>
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

                  {selectedThread !== "" && executionType === "Explain simply" &&
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
                        {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                      </IconButton>
                      <Typography variant="h5" sx={{fontWeight: "bold", color: "green", mt: "1em", textAlign: "center", color: "#0077b6"}}>Response</Typography>
                      <ModalModifyMessegeHistory thread_title={selectedThread} refreshMessageHistory={refreshMessageHistory} setRefreshMessageHistory={setRefreshMessageHistory} setResponse={setResponse}/>
                      <Typography variant="h6" sx={{ fontWeight: "500"}}>
                        <span dangerouslySetInnerHTML={{ __html: response }} /> 
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