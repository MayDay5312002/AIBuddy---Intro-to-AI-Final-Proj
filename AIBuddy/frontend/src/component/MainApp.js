import React from "react";
import MarkdownRenderer from "../sub-component/sub-sub-component/MarkdownRenderer.js";
import { useState, useEffect, useRef } from "react";
import { Button, TextField, Typography, Select, MenuItem, FormControl, 
  InputLabel, Box, Radio, RadioGroup, FormControlLabel, FormLabel, Paper, Divider, IconButton, 
  CircularProgress, List,
  ListItem, ListItemText,
  Modal, Tooltip,
  Icon} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';

import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';

import PrintIcon from '@mui/icons-material/Print';
import PrintDisabledIcon from '@mui/icons-material/PrintDisabled';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import RocketSharpIcon from '@mui/icons-material/RocketSharp'; // For execution type
import AutoStoriesSharpIcon from '@mui/icons-material/AutoStoriesSharp'; // for editor 
import SendIcon from '@mui/icons-material/Send'; //for send button
import AssignmentIcon from '@mui/icons-material/Assignment'; //for to do
import EditDocumentIcon from '@mui/icons-material/EditDocument'; // for editor





import ModalAddThread from "../sub-component/ModalAddThread.js";
import ModalDeleteThread from "../sub-component/ModalDeleteThread.js";
import ModalChangeFlashCard from "../sub-component/ModalChangeFlashCard.js";
import ModalChangeQuiz from "../sub-component/ModalChangeQuiz.js";
import ModalAddFlashCard from "../sub-component/ModalAddFlashCard.js";
import ModalAddQuiz from "../sub-component/ModalAddQuiz.js";
import ModalModifyMessegeHistory from "../sub-component/ModalModifyMessegeHistory.js";
import ModalPresentQuiz from "../sub-component/ModalPresentQuiz.js";
import ModalPresentFlashcards from "../sub-component/ModalPresentFlashcards.js";
import ModalSettings from "../sub-component/ModalSettings.js";
// import BundledEditor from "../sub-component/TextEditor.js";
import Todo from "../sub-component/Todo.js";
import LabeledNumberTab from "../sub-component/sub-sub-component/LabeledNumberTab.js";

import axios from "axios";
import TiptapEditor from "../sub-component/TextEditor.js";
import { useReactToPrint } from "react-to-print";
import { backgroundColor } from "@mui/system";

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


    const [open, setOpen] = useState(false);
    const [openTodo, setOpenTodo] = useState(false);
    

    const [aiSpace, setAiSpace] = useState(null);
    const [temperature, setTemperature] = useState(null);
    const [topP, setTopP] = useState(null);
    const [maxTokens, setMaxTokens] = useState(null);
    const [api, setApi] = useState("");
    const [modelName, setModelName] = useState(null);
    const [baseUrl, setBaseUrl] = useState(null);
    const [oldData, setOldData] = useState({
      temperature: null,
      topP: null,
      maxTokens: null,
      api: "",
      modelName: null,
      baseUrl: null,
      aiSpace: null
    });

    const [leftSection, setLeftSection] = useState(true);
    const [rightSection, setRightSection] = useState(true);

    const [editorOn, setEditorOn] = useState(false);
    const [showAnswerPrint, setShowAnswerPrint] = useState(false);
    const [showAnswerPrintOption, setShowAnswerPrintOption] = useState(false);
    const [clickTriggerPrint, setClickTriggerPrint] = useState(0);  // Counter to force effect
    // const [clickedOptionPrint, setClickedOptionPrint] = useState(false);

    const outputRef = useRef();
    const submitButtonRef = useRef(null);

    const handlePrintOutput = useReactToPrint({
      contentRef: outputRef,
    });

    const [exportContent, setExportContent] = useState(null);



    const [modelTooltipOpen, setModelTooltipOpen] = useState(false);
    const [selectOpen, setSelectOpen] = useState(false);
    const suppressReopen = useRef(false);
    // const [isTipTapOpen]
    
//     useEffect(() => {
//   console.log("outputRef.current:", outputRef.current);
// }, [response]);
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

    const handleChangeExecutionType = (e) => {
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
      if (clickTriggerPrint === 0) return;  // Skip on initial mount
      handlePrintOutput();
      setShowAnswerPrintOption(false);
    }, [clickTriggerPrint]);

    // useEffect(() => {
    //   setIsPortrait(window.matchMedia("(orientation: portrait)").matches);
    // }, [window.innerHeight, window.innerWidth])

  function updateLayout() {
    setIsPortrait(window.matchMedia("(orientation: portrait)").matches);
  }

  let debounceTimer;

  window.addEventListener('resize', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      updateLayout(); // Runs 100ms after resize stops
    }, 100);
  });
    




    const deleteCard = (titleCard, contentCard, id) => {
      axios.post("http://127.0.0.1:4192/api/deleteFlashCard/", {"title": titleCard, "thread": selectedThread, "contentCard": contentCard, "id": id})
      .then((response) => {
        setFlashCards(flashCards.filter(card => card.id !== id));
        setErrorResponseMsg("");
      })
      .catch((error) => {
          setErrorResponseMsg("Error: " + error.response.data["error"]);
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
      let thinking = false;
      const eventSource = new EventSource('http://localhost:4192/api/chatStream/' + '?query=' + query + '&model=' + selectedModel + '&thread=' + selectedThread + 
        "&executionType=" + executionType);
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
          else if(String(event.data).startsWith('{"error":') || String(event.data).startsWith('{{"error":')){
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
        inputType: inputType,
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
            inputType: inputType,
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


    const getSettings = async () => {
      axios.get("http://127.0.0.1:4192/api/getSettings/")
      .then((response) => {
        // console.
        setTemperature(response.data["message"]["temperature"]);
        setTopP(response.data["message"]["topP"]);
        setMaxTokens(response.data["message"]["maxTokens"]);
        setApi(response.data["message"]["apiKey"]);
        setAiSpace(response.data["message"]["aiSpace"]);
        setBaseUrl(response.data["message"]["baseUrl"]);
        setModelName(response.data["message"]["modelName"]);
        setOldData({
          temperature: response.data["message"]["temperature"],
          topP: response.data["message"]["topP"],
          maxTokens: response.data["message"]["maxTokens"],
          api: response.data["message"]["apiKey"],
          aiSpace: response.data["message"]["aiSpace"],
          baseUrl: response.data["message"]["baseUrl"],
          modelName: response.data["message"]["modelName"],
        })
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
        getSettings();
        // console.log(api);


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
            setErrorResponseMsg("Error: " + error.response.data["message"]);
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
          // setSelectedModel(response.data["models"][0])
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
        
        <Box
         sx={{display: "flex",
          flexDirection: isPortrait ? "column" : "row",
          // overflow: "auto",
          height: "100vh",
          // height: {xs: "60vh", sm: "70vh", md: "86vh"},
          // py: "0.75em",
          // flexGrow: "1"
          flex: "1"
          }}
        >

        

          {/******************This is the beginning of the left section******************* */}
        { isFullscreen == false && editorOn == false  && !isPortrait && 
        <Box sx={{
          position: "relative",              // ← anchor for IconButton's absolute positioning
          flexGrow: leftSection ? 3 : 0,
          minWidth: isPortrait ? undefined : leftSection ? "20em" : "auto",
          minHeight: isPortrait ? (leftSection ? "15em" : "2.2em") : undefined,
          flexBasis: 0,
          display: "flex",
          flexDirection: "column",
        }}>
          <Box 
          sx={{
            height: "100%",
            overflow: "visible",
            position: "relative",
          }}
          >
            <Paper sx={{
              px: leftSection ? "1.2em" : "0.3em",
              // pb: "0.3em",
              mr: isPortrait ? "1em" : 0,
              mb: isPortrait ? "1em" : 0,
              overflowY: "auto",               // ← Paper scrolls freely
              height: "100%",                  // ← fill the wrapper's flex-allocated height
              direction: "rtl",                // ← right-to-left scrolling
            }}>
            {/* Beggining of Title */}
              <Box 
              sx={{
                height: "100%",
                direction: "ltr", 
                position: "relative",
                display: "flex",
                flexDirection: "column",
                overflow: "visible"
                }}
              >     

                {/* left-to-right */}
                <Box sx={{position: "relative", zIndex: 2}}>
                  <Typography variant="h4" sx={{fontWeight: "bold", textAlign: "center", color: "#383838ff", lineHeight: "0"}}>
                    <Box sx={{cursor: "pointer" }} component={"span"} onClick={() => window.location.reload()}>
                      <img src="http://127.0.0.1:4192/static/images/Logo.png"  style={{position: "relative", top: "0.5rem", height: "7vh" }}/>
                      {leftSection &&
                      <Typography
                        variant="h4"
                        sx={{
                          display: "inline",
                          fontWeight: "600",
                          fontSize: "4.7vh",
                          color: "#3a3838ff",
                          // textShadow: "2px 2px 0px rgba(0, 0, 0, 0.1), 4px 4px 8px rgba(0, 0, 0, 0.15)",
                          // fontFamily: ['Brush Script MT', 'Comic Sans MS'],
                          fontFamily: 'Brush Script MT',
                          lineHeight: 1,        // ← kills the excess vertical space
                          // top: "10rem",
                        }}
                      >
                        PonderUp
                      </Typography>
                      }

                    </Box>
                  </Typography>
                </Box>
                    
                <hr 
                style=
                {{
                  margin: leftSection ? "1em 2em": "1em 0.5em",
                  fontSize: "0.6rem", 
                  borderRadius: "10em", 
                  borderWidth: "0.1em", 
                  color: "#cfcfcfff",
                  borderTopColor: "#8a8a8aff",
                  borderBottomColor: 'rgb(194, 213, 219)',
                  color: '#a5a5a5ff',
                }}
                />
                {/* End of Title */}
              
                <Box
                sx={{
                  // width: "95%",
                  // padding: "0.3em 0.5em",
                  // padding: "0 0 0.3em 0.12em",
                  // p: "0.3em 0.5em",
                  // mb: "0.1em",
                  // p: "0 0 0.3em 0.12em",
                  // borderRadius: 4,
                  textAlign: "center",
                  display: isFullscreen === false ? "block" : "none",
                }}
                >
                {leftSection ? 
                  <Button 
                    variant="contained" 
                    startIcon={<EditDocumentIcon />}
                    sx={{
                      // position: "absolute", 
                      // top: "1em", 
                      // left: "2.3em", 
                      fontSize: "0.85rem", 
                      // visibility: isFullscreen === false ? "visible" : "hidden", 
                      zIndex: 1,
                    }}
                    onClick={()=> {
                      if (editorOn === false){
                        setEditorOn(!editorOn);
                        setExportContent("");
                      }
                      else{
                        setEditorOn(!editorOn);
                        setIsFullscreen(false);
                        setExportContent(null);
                      }
                    }}
                  >
                    Editor
                  </Button>
                  :
                  <IconButton 
                    onClick={()=> { 
                      if (editorOn === false){
                        setEditorOn(!editorOn);
                        setExportContent("");
                      }
                      else{
                        setEditorOn(!editorOn);
                        setIsFullscreen(false);
                        setExportContent(null);
                      }
                    }
                      
                  }>
                    <EditDocumentIcon 
                    sx={{fontSize: { xs: "0.9em", sm: "0.9em", md: "1.2em" }}}
                    />
                  </IconButton>
                }

                {/* this is button for editor */}
                <IconButton onClick={() => setOpenTodo(v => !v)}>
                  
                  <AssignmentIcon sx={{
                    // color: 'rgb(71, 69, 69)',
                    fontSize: { xs: "0.9em", sm: "0.9em", md: "1.2em" }
                  }} />
                </IconButton>

              </Box>

                {leftSection && 
                <div className="leftSectionDiv">
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
                  <FormControl sx={{mt: "0.2em"}}>
                    <FormLabel>
                      <RocketSharpIcon sx={{mr: "0.2em", transform: "translateY(0.1em)"}}/>
                      Choose Execution Type
                    </FormLabel>
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
                  <Divider sx={{mb:"1em"}}/>
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
                      }}
                    >
                      <FormControlLabel value="file" control={<Radio />} label="Upload a File" />
                      <FormControlLabel value="url" control={<Radio />} label="Enter a youtube URL" />
                      { (executionType === "Create flash cards" || executionType === "Create quiz") &&
                        <>
                        <FormControlLabel value="model" control={<Radio />} label="Model independent" />
                        <FormControlLabel value="Kiwix" control={<Radio />} label="Kiwix Files" />
                        <FormControlLabel value="web search" control={<Radio />} label="Web Search" />
                        </>
                      }
                    </RadioGroup>
                  </FormControl>
                  <Divider />
                  </>
                  }

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
                        {executionType !== "Explain with Kiwix" && inputType !== "Kiwix"? "Vector Store Content" : "Kiwix Folder"}: {(!(executionType === "Explain with Kiwix" || inputType === "Kiwix") && (vectorStoreContent.includes("youtu.be") || vectorStoreContent.includes("youtube.com"))
                        ) ? 
                        <a href={vectorStoreContent} target="_blank">{vectorStoreContent}</a> : (executionType === "Explain with Kiwix" || inputType === "Kiwix" ? folderPath : vectorStoreContent)}
                      </Typography>
                      
                    <Divider sx={{mt: "1em"}}/> 
                    </Box>
                    }

                    </>
                  }

                </div>
                }
                <Box sx={{mt:"auto"}}>
                  <Divider 
                  sx={{
                    mb:"0.5em", 
                    borderWidth: "0.1em",
                    // fontSize: "0.6rem",
                    // borderRadius: "10em",
                    // borderWidth: "0.1em",
                    // color: "rgb(165, 165, 165)",
                    // borderTopColor: "rgb(138, 138, 138)",
                    // borderBottomColor: "rgb(194, 213, 219)"
                  }}
                  />
                  <ModalSettings 
                  aiSpace={aiSpace} 
                  setAiSpace={setAiSpace}
                  setApi={setApi}
                  api={api}
                  setTemperature={setTemperature}
                  temperature={temperature}
                  setTopP={setTopP}
                  topP={topP}
                  setMaxTokens={setMaxTokens}
                  maxTokens={maxTokens}
                  modelName={modelName}
                  setModelName={setModelName}
                  baseUrl={baseUrl}
                  setBaseUrl={setBaseUrl}
                  oldData={oldData}
                  setOldData={setOldData}
                  leftSection={leftSection}
                  />
                </Box>
              </Box>
            </Paper>
            {/*********************Todo component here here *****************/}
            <Todo open={openTodo} setOpen={setOpenTodo} top={leftSection ? "9em" : "10.5em"} right={leftSection ? "-1em" : "-17em"}/>

          </Box>
          <IconButton
            size="small"
            sx={{
              "&:hover": { backgroundColor: "#FFFFFF" },
              position: "absolute",
              right: "-0.6em",
              top: "6.3em",                  // ← adjust to align with where you want it
              height: "1.7em",
              backgroundColor: "#FFFFFF",
              p: "0.2em",
              borderRadius: "20%",
            }}
            onClick={() => setLeftSection(!leftSection)}
          >
            <ExpandLessIcon sx={{transform: leftSection ? "rotate(-90deg)" : "rotate(90deg)"}}/>
          </IconButton>

        </Box>
        }
        {/*/////////////////////////This is the the end of left section/////////////////////////////////////////*/}

        {/*/////////////////////////This is the  right section/////////////////////////////////////////*/}

          <Paper 
          sx=
          {{
          py: !editorOn ? "0.8em" : "0.3em",
          pb: "0.8em",
          // px: isPortrait ? "2em" : {xs: "2em", md: "10em", lg: "20em"}, 
          px: "2em",
          // pb: "3em",
          borderRadius: 4, 
          // top: 0, 
          mx: "1em", 
          flexGrow: 15, 
          overflow: editorOn === false ? "visible" : "hidden", 
          position: "relative", 
          display: "flex", 
          flexDirection: "column",
          flexBasis: 0,
          alignItems: "center",
          my: "0.75em",
          // maskImage: isPortrait ?'linear-gradient(to right, rgba(0,0,0,0.6) 0%, black 2%, black 98%, rgba(0,0,0,0.6) 100%)' 
          //                       : 'linear-gradient(to right, rgba(0,0,0,0.6) 0%, black 5%, black 95%, rgba(0,0,0,0.6) 100%)',
          // WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,0.6) 0%, black 5%, black 95.5%, rgba(0,0,0,0.6) 100%)',
          maskImage: 'linear-gradient(to right, transparent, black 3%, black 97%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 3%, black 97%, transparent)'
          // color: "transparent"
          }}>
          {editorOn &&
            <Paper
            sx={{
              width: "95%",
              // padding: "0.3em 0.5em",
              // padding: "0 0 0.3em 0.12em",
              p: "0.3em 0.5em",
              mb: "0.1em",
              // p: "0 0 0.3em 0.12em",
              // borderRadius: 4,
              display: isFullscreen === false ? "block" : "none",
              // position: "relative",
            }}
            >
              <Button 
                variant="contained" 
                sx={{
                  // position: "absolute", 
                  // top: "1em", 
                  // left: "2.3em", 
                  fontSize: "0.85rem", 
                  // visibility: isFullscreen === false ? "visible" : "hidden", 
                  zIndex: 1,
                }}
                onClick={()=> {
                  if (editorOn === false){
                    setEditorOn(!editorOn);
                    setExportContent("");
                  }
                  else{
                    setEditorOn(!editorOn);
                    setIsFullscreen(false);
                    setExportContent(null);
                  }
                }}
              >
                Exit
              </Button>

              {/* <Todo /> */}
              <Box sx={{position: "relative", display: "inline-block", ml: "0.3em"}}>
                <IconButton onClick={() => setOpenTodo(v => !v)}>
                  <AssignmentIcon sx={{
                    fontSize: { xs: "0.9em", sm: "0.9em", md: "1.2em" }
                  }} />
                </IconButton>
                <Todo open={openTodo} setOpen={setOpenTodo} top={"3em"} right={ "-13em"}/>
              </Box>

            </Paper>
          } 
           
            {/*///////////////////////////////Output Part below Right Section///////////////////////////////////////////////////////*/}
                  {/* {selectedThread !== "" && (executionType === "Explain with document" || executionType === "Explain with Kiwix" || 
                    executionType === "Explain with web search" || executionType === "Explain Simply") && editorOn === false && */}
                  {(executionType === "Explain with document" || executionType === "Explain with Kiwix" || 
                    executionType === "Explain with web search" || executionType === "Explain Simply") && editorOn === false &&
                    <Paper 
                    ref={paperRefResponse}
                    onScroll={handleScroll}
                    sx={{
                      // px: "3vh",
                      // pt: "2vh",
                      backgroundColor: '#f9fafb',
                      borderRadius: "1em",
                      border: '1px solid #e0e0e0',
                      borderRadius: "0 1em 1em 1em",
                      overflow: "auto",
                      position: "relative",
                      flex: "1",
                      minHeight: {xs: "20em", sm: "18em", md: "16em"},
                      pb: isFullscreen ? 0 : "0.75em",
                      width: "95%",
                      
                    }}
                    >
                      {/* <Typography variant="h5" sx={{fontWeight: "bold", color: "green", mt: "1em", textAlign: "center", color: "#0077b6"}}>Response</Typography> */}
                        <Box sx=
                        {{
                          display: 'flex', 
                          justifyContent: 'left', 
                          columnGap: "0.1em",
                          pb: "0.3em", 
                          position: "sticky", 
                          top: "0", 
                          zIndex: 2, 
                          backgroundColor: "#F9FAFB"
                        }}
                        >
                          <Typography 
                          variant="h6" 
                          sx={{
                            fontWeight: "bold", 
                            textAlign: "center", 
                            backgroundColor: "#1565C0",
                            color: "#F9FAFB",
                            transform: "translateY(5%)",
                            p: "0.1em 0.3em",
                            borderRadius: "0 0 0.5em 0"

                          }}
                          >
                            Response
                          </Typography>
                          {/* <Divider sx={{mx: "0.1em"}}></Divider> */}
                          <hr style={{margin: "0.2em 0.2em", border: "0.1em solid #1565C0"}}></hr>
                          <IconButton onClick={() => {
                            if (response !== "")handlePrintOutput();
                            }
                          }
                          disabled={response !== "" ? false : true}
                          >
                            {response === "" ? <PrintDisabledIcon /> : <PrintIcon />}
                            </IconButton>
                          <ModalModifyMessegeHistory thread_title={selectedThread} refreshMessageHistory={refreshMessageHistory} 
                            setRefreshMessageHistory={setRefreshMessageHistory} setResponse={setResponse} aiSpace={aiSpace}/>
                          <IconButton 
                          onClick={() => 
                            {
                              setExportContent(response);
                              setIsFullscreen(false);
                              setEditorOn(true);
                            }
                          }
                          >
                            <FileUploadIcon />
                          </IconButton>
                          {/* <IconButton
                          onClick={toggleFullscreen}
                          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                          >
                          </IconButton> */}
                          <IconButton
                          onClick={toggleFullscreen}
                          sx={{marginLeft: "auto"}}
                          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                          // sx={}
                          disabled={response !== "" ? false : true}
                          >
                            {isFullscreen ? <FullscreenExitIcon/> : <FullscreenIcon />}
                          </IconButton>
                        </Box>
                      <Box 
                      ref={outputRef}
                      sx={{
                        fontSize: "1.2em",
                        p: "0.3em 1em 1em 1em",
                        // typography: "body1",
                      }}
                      >
                        {/* <Typography variant="h6" sx={{ fontWeight: 500 }}> */}
                          <MarkdownRenderer>{errorResponseMsg === "" ? response : errorResponseMsg}</MarkdownRenderer>
                        {/* </Typography> */}
                      </Box>


                    </Paper>
                
                  }
                  { executionType === "Create flash cards" && flashCards != [] && editorOn === false &&
                    <Paper 
                    ref={paperRefFlashCards}
                    sx={{
                      // px: "3vh",
                      // pt: "2vh",
                      backgroundColor: '#f9fafb',
                      borderRadius: "1em",
                      border: '1px solid #e0e0e0',
                      borderRadius: "0 1em 1em 1em",
                      // mt: isFullscreen ? 0 : "1em",
                      // height: isFullscreen ? "98vh" : {xs: "12em", sm: "13em", md: "16em"},
                      // height: `calc(100vh - ${outerPaperHeight}px)`,
                      overflow: "auto",
                      position: "relative",
                      flex: "1",
                      minHeight: {xs: "20em", sm: "18em", md: "16em"},
                      pb: isFullscreen ? 0 : "0.75em",
                      width: "95%"
                    }}
                    >
                      <Box sx=
                      {{
                        display: 'flex', 
                        justifyContent: 'left', 
                        columnGap: "0.1em",
                        pb: "0.3em", 
                        mb: "0.5em",
                        position: "sticky", 
                        top: "0", 
                        zIndex: 2, 
                        backgroundColor: "#F9FAFB",
                      }}
                      >
                        <Typography 
                        variant="h6" 
                        sx={{
                          fontWeight: "bold", 
                          textAlign: "center", 
                          backgroundColor: "#1565C0",
                          color: "#F9FAFB",
                          transform: "translateY(5%)",
                          p: "0.1em 0.3em",
                          borderRadius: "0 0 0.5em 0"
                          
                        }}
                        >
                          Flash Cards
                        </Typography>
                        <hr style={{margin: "0.2em 0.2em", border: "0.1em solid #1565C0"}}></hr>
                        <ModalAddFlashCard setFlashCards={setFlashCards} thread_title={selectedThread} setNewFlashCards={setNewFlashCards}/>
                        <ModalPresentFlashcards flashcards={flashCards} />
                        <IconButton 
                        onClick={() => {if(flashCards.length !== 0)handlePrintOutput()}}
                        disabled={flashCards?.length === 0 ? true : false}
                        >
                        {flashCards.length === 0 ? <PrintDisabledIcon /> : <PrintIcon />}
                        </IconButton>
                        <IconButton
                        onClick={toggleFullscreen}
                        // sx={{ position: 'absolute', top: 8, right: 8 }}
                        sx={{marginLeft: "auto"}}
                        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                        disabled={flashCards?.length === 0 ? true : false} 
                        >
                        {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                        </IconButton>
                      </Box>
                      <Typography variant="h6" 
                      sx={{ 
                        fontWeight: 500,
                        display: errorResponseMsg !== "" ? "block" : "none"

                      }}>
                          <MarkdownRenderer>{errorResponseMsg === "" ? response : errorResponseMsg}</MarkdownRenderer>
                      </Typography>
                      <div ref={outputRef}>
                      
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
                      </div>
                    </Paper>
                  }
                  { executionType === "Create quiz" && quizzes != [] && editorOn === false &&
                    <Paper 
                    ref={paperRefQuizzes}
                    sx={{
                      // px: "3vh",
                      // pt: "2vh",
                      backgroundColor: '#f9fafb',
                      borderRadius: "1em",
                      border: '1px solid #e0e0e0',
                      borderRadius: "0 1em 1em 1em",
                      // mt: isFullscreen ? 0 : "1em",
                      // height: isFullscreen ? "98vh" : {xs: "12em", sm: "13em", md: "16em"},
                      // height: `calc(100vh - ${outerPaperHeight}px)`,
                      overflow: "auto",
                      position: "relative",
                      flex: "1",
                      minHeight: {xs: "20em", sm: "18em", md: "16em"},
                      pb: isFullscreen ? 0 : "0.75em",
                      width: "95%"
                    }}
                    >
                      
                      {/* <Typography variant="h6" sx={{fontWeight: "500"}}>{response}</Typography> */}
                      <Box sx=
                      {{
                        display: 'flex', 
                        justifyContent: 'left', 
                        columnGap: "0.1em",
                        pb: "0.3em", 
                        mb: "0.5em",
                        position: "sticky", 
                        top: "0", 
                        zIndex: 2, 
                        backgroundColor: "#F9FAFB",
                        overflow: "auto"
                      }}
                      >
                        {/* <Typography variant="h5" sx={{fontWeight: "bold", color: "green", textAlign: "center", color:"#0077b6"}}>Quizzes</Typography> */}
                        <Typography 
                        variant="h6" 
                        sx={{
                          fontWeight: "bold", 
                          textAlign: "center", 
                          backgroundColor: "#1565C0",
                          color: "#F9FAFB",
                          transform: "translateY(5%)",
                          p: "0.1em 0.3em",
                          borderRadius: "0 0 0.5em 0"
                          
                        }}
                        >
                          Quizzes
                        </Typography>
                        <hr style={{margin: "0.2em 0.2em", border: "0.1em solid #1565C0"}}></hr>
                        <ModalAddQuiz setQuizzes={setQuizzes} thread_title={selectedThread} setNewQuizzes={setNewQuizzes}/>
                        <ModalPresentQuiz quizzes={quizzes} />
                        <span>
                        <IconButton onClick={() =>{
                            // handlePrintOutput();
                            if(quizzes.length !== 0)setShowAnswerPrintOption(!showAnswerPrintOption);
                          }
                        }
                        disabled={quizzes?.length === 0 ? true : false}
                        >
                          {quizzes.length === 0 ? <PrintDisabledIcon /> : <PrintIcon />}
                        </IconButton>
                        </span>
                        {showAnswerPrintOption ? 
                          <Box sx={{display: 'flex', justifyContent: 'center', my: "0.5em", alignContent: "center", transform: "translateY(3%)"}}>
                          {/* <Box> */}
                            Show Answers?&nbsp;
                            <Box 
                              component="span" 
                              sx={{ 
                                cursor: "pointer",
                                ':hover': { backgroundColor: 'lightblue' },
                                // padding: "0.1em",
                                borderRadius: "0.5em"
                              }}
                              onClick={() => {
                                setShowAnswerPrint(true);
                                setClickTriggerPrint(prev => prev + 1);
                                }
                              }
                            >
                            Yes
                            </Box>
                            &nbsp;
                            /
                            &nbsp;
                            <Box 
                              component="span" 
                              sx={{ 
                                cursor: "pointer",
                                ':hover': { backgroundColor: 'lightblue' } ,
                                // padding: "0.1em",
                                borderRadius: "0.5em"
                              }}
                              onClick={() => {
                                // setClickedOptionPrint(true);
                                setShowAnswerPrint(false);
                                setClickTriggerPrint(prev => prev + 1);
                                // handlePrintOutput();
                                // setShowAnswerPrintOption(!showAnswerPrintOption);
                                // setClickedOptionPrint(false);
                                }
                              }
                            >
                            No
                            </Box>
                          </Box>
                          : 
                          ""
                        }
                        <IconButton
                          onClick={toggleFullscreen}
                          sx={{marginLeft: "auto"}}
                          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                          disabled={quizzes?.length === 0 ? true : false}
                        >
                          {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                        </IconButton>
                      </Box>
                      
                      <Typography variant="h6" 
                      sx={{ 
                        fontWeight: 500,
                        display: errorResponseMsg !== "" ? "block" : "none"

                      }}>
                          <MarkdownRenderer>{errorResponseMsg === "" ? response : errorResponseMsg}</MarkdownRenderer>
                      </Typography>
                      {/* <div ref={outputRef}></div> */}
                      <div ref={outputRef}>
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
                                className={choice === quiz.answer && showAnswerPrint ? "right-choice" : "wrong-choice"} //asds
                              >
                                <ListItemText primary={choice} />
                              </ListItem>
                            ))}
                          </List>
                        </Paper>
                      ))}
                      </div>
                    </Paper>
                  }
                  {/* {editorOn && exportContent !== null && */}
                  <div style={{
                    display: editorOn && exportContent !== null ? "flex" : "none",
                    flex: 1,
                    width: "95%",
                    minHeight: 0
                  }}>
                    <TiptapEditor newContent={exportContent} isTipTapOpen={editorOn}/>
                  </div>
                  {isFullscreen === false && rightSection === true && editorOn === false &&
                  //this is where to submit prompt
                          <Box sx={{width: "95%", position: "relative"}}>
                            {executionType === "Create flash cards" || executionType === "Create quiz" ?
                            <LabeledNumberTab //################input for query#################
                              labelTab= {executionType === "Create flash cards" ? "Number of flash cards:" : "Number of questions:"}
                              valueTab={numberEx}
                              onChangeTab={setNumberEx}
                              variant="outlined"
                              value={query}
                              onChange={(e) => setQuery(e.target.value)}
                            
                              sx={{ 
                                my: "0.5em",
                                // pr: "1em",
                                // width: "100%",
                                '& .MuiInputBase-input': {
                                  // resize: "vertical",
                                  // maxHeight: 110, // enforce max height for 4 rows
                                  pr: "3em"
                                },
                                backgroundColor: "#FFFFFF"
                              }}
                              fullWidth
                              required
                              multiline
                              minRows={1}
                              maxRows={4}
                              inputProps={{
                                style: { resize: "vertical", overflow: "auto", paddingRight: "3em" }
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
                            ///////////////
                            :
                            <Box sx={{position: "relative"}}>
                              <TextField //################input for query#################
                              variant="outlined"
                              value={query}
                              onChange={(e) => setQuery(e.target.value)}
                              sx={{ 
                                my: "0.5em",
                                // pr: "1em",
                                // width: "100%",
                                backgroundColor: "#FFFFFF",
                                '& .MuiInputBase-input': {
                                  // resize: "vertical",
                                  // maxHeight: 110, // enforce max height for 4 rows
                                  pr: "3em"
                                },
                                backgroundColor: "#FFFFFF"
                              }}
                              fullWidth
                              required
                              multiline
                              minRows={1}
                              maxRows={4}
                              inputProps={{
                                style: { resize: "vertical", overflow: "auto", paddingRight: "3em" }
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
                               {/* <Select
                                labelId="dropdown-label"
                                value={selectedModel}
                                // label="Select Model"
                                onChange={handleSelectedChange}
                                sx={{
                                  position: "absolute", 
                                  right: "0.8em", 
                                  bottom: "-0.8em", 
                                  width: "9em", 
                                  fontSize: "0.8rem",
                                  zIndex: -1,
                                  // p: "0"
                                  "& .MuiSelect-select": {
                                    p: "0.1em 01em"
                                  }
                                }}
                              >
                                {models.map((model, index) => (
                                  <MenuItem key={index} value={model}>
                                    {model}
                                  </MenuItem>
                                ))}
                              </Select> */}
                            </Box>
                          } 
                          <IconButton
                            ref={submitButtonRef}
                            sx={{
                              position: "absolute",
                              right: "0.8em",
                              bottom: executionType === "Create flash cards" || executionType === "Create quiz" ? "0.65em" : "0.65em",
                              backgroundColor: "primary.main",
                              color: "white",
                              "&:hover": { backgroundColor: "primary.dark" },
                              "&:disabled": { backgroundColor: "grey.300" },
                              zIndex: 1,
                            }}
                            disabled={readyToQuery === false || selectedThread === "" || query === "" || loading || selectedModel === ""}
                            onClick={
                              (executionType === "Explain with document" || executionType === "Explain with Kiwix" || executionType === "Explain with web search" || executionType === "Explain Simply")
                              ? handleQuery
                              : (executionType === "Create flash cards" ? handleCreateFlashCards : handleCreateQuiz)
                            }
                          >
                            {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : <SendIcon />}
                          </IconButton>


                          
                          {aiSpace === "Ollama" &&
                            <Tooltip
                             title="Choose which AI model to use"
                              open={modelTooltipOpen && !selectOpen}
                              onOpen={() => {
                                if (suppressReopen.current) return; // ignore phantom mouseover right after close
                                setModelTooltipOpen(true);
                              }}
                              onClose={() => setModelTooltipOpen(false)}
                              disableFocusListener
                            >
                              <Select
                                labelId="dropdown-label"
                                value={selectedModel}
                                onOpen={() => {
                                  setSelectOpen(true);
                                  setModelTooltipOpen(false); // hide tooltip the instant the menu opens
                                }}
                                onClose={() => {
                                  setSelectOpen(false),   
                                  setModelTooltipOpen(false);
                                  suppressReopen.current = true;
                                  setTimeout(() => { suppressReopen.current = false; }, 300);
                                }}
                                onChange={(e) => {
                                  setSelectOpen(false);
                                  handleSelectedChange(e);
                                  setModelTooltipOpen(false);
                                  suppressReopen.current = true;
                                  setTimeout(() => { suppressReopen.current = false; }, 300);
                                }}
                                MenuProps={{
                                  slotProps: {
                                    paper: {
                                      style: {
                                        maxHeight: (36 * 6)+8, //only show 6 rows. Each item is 36px and the padding of the MuiList is 8
                                        overflowY: 'auto',
                                      },
                                    },
                                  },
                                }}
                                sx={{
                                  position: "absolute", 
                                  right: "1.5em", 
                                  bottom: "-0.8em", 
                                  width: "9em", 
                                  fontSize: "0.8rem",
                                  zIndex: -1,
                                  // p: "0"
                                  "& .MuiSelect-select": {
                                    p: "0.1em 1em"
                                  },

                                }}
                              >
                                {models.map((model, index) => (
                                  <MenuItem key={index} value={model}>
                                    {model}
                                  </MenuItem>
                                ))}
                              </Select>
                            </Tooltip>
                          }
                          {/* <IconButton>
                            {(loading) ? <CircularProgress size={24} /> : ""}
                          </IconButton> */}
                          {/* <Typography variant="caption" sx={{display: "block", fontStyle: "italic"}}>Note: Please ensure Thread and File/URL are set to submit prompt.</Typography> */}
                          {/* <Typography variant="body2" sx={{display: "block", color: "red", minHeight: "1.5em", fontSize:"0.8rem", mb: "0.1em"}}>{errorResponseMsg}</Typography> */}
                          {/* <Divider sx={{mb: "0.5em"}}/> */}
                      </Box>
                  // </div>
                  }

          </Paper>
          </Box>

        
        </div>
    );
};

export default MainApp;