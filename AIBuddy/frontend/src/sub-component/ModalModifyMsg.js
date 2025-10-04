import * as React from 'react';
import { useState, useEffect, useRef} from 'react';
import { Box, Button, Typography, TextField, Modal, Divider, IconButton, Paper, 
FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Select, MenuItem, InputLabel, CircularProgress
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';



const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: "80vw",
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};


export default function ModalModifyMsg({setResponse,thread_title, refreshMessageHistory, setRefreshMessageHistory, oldResponse, oldQuestion, document,
  
  
}) {


  const [open, setOpen] = useState(false);
  //use state for current variables
  const [content, setContent] = useState(oldResponse);
  const [question, setQuestion] = useState(oldQuestion);
  const [file, setFile] = useState(null);
  const [inputType, setInputType] = useState("document");
  const [url, setUrl] = useState("");
  const [vectorStoreContent, setVectorStoreContent] = useState("");
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');

  const [errorResponse, setErrorResponse] = useState("");
  const [errorResponseMsg, setErrorResponseMsg] = useState('');
  const [modifyOption, setModifyOption] = useState('Auto');
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [folderPath, setFolderPath] = useState("");
  const [documentType, setDocumentType] = useState('file');
  const TextFieldRef = useRef(null);
  const [autoScrollComp, setAutoScrollComp] = useState(true);


  useEffect(() => {
    axios.get('http://localhost:4192/api/models/').then((response) => {
      setModels(response.data["models"]);
      setSelectedModel(response.data["models"][0]);
    })
    .catch((error) => {
        console.error("Error uploading file:", error);
    })
  }, [open])

  useEffect(() => {
    if (autoScrollComp && TextFieldRef.current) {
      
      TextFieldRef.current.scrollTop = TextFieldRef.current.scrollHeight;
      // TextFieldRef.current.scrollTo({
      //   top: TextFieldRef.current.scrollHeight,
      //   behavior: 'smooth'
      // });
    }
  }, [content, autoScrollComp]);
  

  const handleOpen = () => {
    setOpen(true);
  }
  const handleClose = () => {
    setContent(oldResponse);
    setQuestion(oldQuestion);
    setFile(null);
    setInputType("document");
    setUrl("");
    setVectorStoreContent("");
    setOpen(false);
    setErrorResponse("");
    setErrorResponseMsg('');
    setModifyOption('Auto');
    setDocumentType('file');
  }
  const handleFileChangeHere = (event) => {
    const fileTemp = event.target.files[0];
    if (fileTemp) {
      // console.log("Selected file:", file.name);
      setFile(fileTemp);
      console.log(fileTemp);
      // You can now upload or process the file
    }

  };

  const handleScroll = () => {
     if (!TextFieldRef.current) return;
     const { scrollTop, scrollHeight, clientHeight } = TextFieldRef.current;
     // If the user scrolls up (not at bottom), turn off autoScrollComp.
     // You might add a tolerance (e.g., 20px) for accidental movements.
     if (scrollTop + clientHeight < scrollHeight - 5) {
       setAutoScrollComp(false);
     } else {
       setAutoScrollComp(true);
     }
  };

  const handleSubmitFile = () => {
    setErrorResponse(<CircularProgress size={20} />)
    setVectorStoreContent("");
    setLoading(true);
    const formData = new FormData();
    if(documentType === "file"){
      if(file===null){
        console.log("Please select a file");
        return
      }
      formData.append("file", file);
    }
    else if(documentType === "url"){
      if(url===""){
        console.log("Please enter a url");
        return
      }  
      formData.append("url", url);
    }
    // formData.append("url", url);
    formData.append("modifyMsg", "true");
    axios.post("http://127.0.0.1:4192/api/fileUpload/", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        }
    })
    .then(response => {
      // Handle the response from the server
      // console.log(response.data);
      // setVectorStoreContent(response.data); 
      setVectorStoreContent(documentType === "file"? file.name : url);
      setErrorResponse("Success");
      setLoading(false);
    })
    .catch(error => {
      // Handle any errors that occurred during the request
      setErrorResponse("Error uploading file");
      console.error(error);
    });
  }

  const handleSubmitFolder = () => {
      setErrorResponse(<CircularProgress size={20} />);
      setLoading(true);
      axios.get('http://127.0.0.1:4192/api/uploadFolder/')
      .then((response) => {
        setFolderPath(response.data["folderPath"]);
        // setReadyToQuery(true);
        setLoading(false);
        setErrorResponse("Success");
      })
      .catch((error) => {
          // console.error("Error uploading file:", error);
          setErrorResponse("Error: " + error.response);
          setLoading(false);
      });
  };

  const handleQueryAuto = () => {
      let oldDocumentNew = (document.includes("youtube") || document.includes("youtu.be")) ? document.replace("&", "%26") : document //need to replace & with %26 to avoid error
      const eventSource = new EventSource('http://localhost:4192/api/modifyMessage/' + '?query=' + encodeURIComponent(question) + '&model=' 
      + encodeURIComponent(selectedModel) +  '&thread=' + encodeURIComponent(thread_title) + '&oldQuestion=' + encodeURIComponent(oldQuestion) + 
      '&oldDocument=' + encodeURIComponent(oldDocumentNew) + '&oldResponse=' + encodeURIComponent(oldResponse) + 
      "&newDocument=" + (inputType === "document"  && documentType === "file"? encodeURIComponent(file.name) : encodeURIComponent(url)) + 
      "&executionType=" + encodeURIComponent(inputType)
      );
      setContent('');
      setResponse(''); // clear old response
      setGenerating(true);
      setErrorResponseMsg(<CircularProgress size={18} />)
      TextFieldRef.current.scrollTop = TextFieldRef.current.scrollHeight;
      eventSource.onmessage = function(event) {
          if (event.data === "[DONE]") {
              eventSource.close();
              // console.log("DONE!!");
              setRefreshMessageHistory(!refreshMessageHistory);
              setGenerating(false);
              setErrorResponseMsg("Success");
              return;
          }
          setContent(prev => prev + event.data);
          setResponse(prev => prev + event.data);
      };
    
      eventSource.onerror = function(err) {
          // console.error('EventSource failed:', err);
          // setReadToQuery(false)
          setErrorResponseMsg("Error: " + err.message);
          eventSource.close();
      };
    
      return () => {
          eventSource.close();
      };
  };

  const handleQueryManual = () => {
    setErrorResponseMsg(<CircularProgress size={18} />)
    axios.post("http://localhost:4192/api/modifyMessageManual/", 
      {"thread":thread_title, "oldQuestion": oldQuestion, "oldResponse": oldResponse, "query": question, 
        "newResponse": content, "oldDocument": document, 
        "newDocument": (vectorStoreContent === "") ? document : (documentType === "file" ? file.name : url)})
    .then((response) => {
      // Handle the response from the server
      // console.log(response.data);
      setRefreshMessageHistory(!refreshMessageHistory);
      // handleClose();
      // print("Done");
      setResponse(content);
      setErrorResponseMsg("Success");
    })
    .catch(error => {
      // Handle any errors that occurred during the request
      setErrorResponseMsg("Error uploading file");
      console.error(error);
    });
  }

  useEffect(() => {
    if(modifyOption == "Auto"){
      setContent(oldResponse);
      setQuestion(oldQuestion);
      if(documentType === "text"){
        setDocumentType("file");
      }
    }
    if(modifyOption == "Manual"){
      setInputType("document");
    }
  }, [modifyOption])
  




  return (
    <Box component={"span"}>
    <IconButton onClick={handleOpen} sx={{}}><EditIcon /></IconButton>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box 
        sx={{
          ...style, 
          borderRadius: 2, 
          border: "none", 
          width: {xs:"80vw", sm: "60vw", md: "30vw"},

        }}>
          <IconButton onClick={handleClose} sx={{position: "absolute", right: 18}}><CloseIcon /></IconButton>
          <Typography id="modal-modal-title" variant="h5" component="h2" sx={{fontWeight: 500}}>
            Modify Message History
          </Typography>
          <Button variant={ modifyOption === "Manual" ? "outlined" : "contained" }
           onClick={() =>{ 
            if (generating) return;
            if(modifyOption === "Manual" && documentType === "text"){/////////////////////////////////////////////////////
              setVectorStoreContent("");
              setUrl("");
            }
            setModifyOption(modifyOption === "Manual" ? "Auto" : "Manual");
            
           }}
           component="span" sx={{marginTop: "0.5em", marginBottom: "0.5em", fontSize: "0.85em"}}>{modifyOption}</Button>
          <Divider sx={{my: 1}}/>

          <Paper 
          sx=
          {{p: 1,
           maxHeight: {xs:"80vh", sm: "60vh", md: "60vh"},
           overflow: "auto"
           }}>
            <Typography variant="h6" component="h2" >Modify Message</Typography>
            <Divider sx={{my: 1}}/>
            <Typography variant="h6" component="h2" >Question</Typography>
            <TextField
              id="outlined-basic"
              label="Question"
              variant="outlined"
              sx={{my: 1}}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              fullWidth
              multiline
              rows={2}
            />
            <Divider sx={{my: 1}}/>

              <Typography variant="h6" component="h2" sx={{mb: "0.5em", display: "block", }}>
                {inputType === "document" ? 
                "Upload a Document" 
                : 
                  (inputType === "Kiwix" ?
                    "Upload Kiwix folder"
                    :
                    (inputType === "Web Search" ?
                      "Web Search"
                      :
                      "Explain Simply"
                    )
                  )
                }
              </Typography>
                <FormControl>
                  <FormLabel>Choose Execution Type</FormLabel>
                  <RadioGroup
                    row
                    value={inputType}
                    onChange={(event => {setInputType(event.target.value)})}
                  >
                    {/* <FormControlLabel value="file" control={<Radio />} label="Upload a File" />
                    <FormControlLabel value="url" control={<Radio />} label="Enter a youtube URL" /> */}
                    <FormControlLabel value="document" control={<Radio />} label="Upload a Document" />
                    {modifyOption === "Auto" &&
                    <>
                      <Divider sx={{my: "0.8em"}}/>
                      <FormControlLabel value="Kiwix" control={<Radio />} label="Upload Kiwix folder" />
                      <FormControlLabel value="Web Search" control={<Radio />} label="Web Search" />
                      <FormControlLabel value="Explain Simply" control={<Radio />} label="Explain Simply" />
                    </>
                    }
                  </RadioGroup>
                </FormControl>

                { inputType === "document" &&
                <FormControl>
                  <FormLabel>Choose Input Type</FormLabel>
                  <RadioGroup
                    row
                    value={documentType}
                    onChange={(event => {setDocumentType(event.target.value)})}
                  >
                    <FormControlLabel value="file" control={<Radio />} label="Upload a File" />
                    <FormControlLabel value="url" control={<Radio />} label="Enter a youtube URL" /> 
                    { modifyOption === "Manual" &&
                    <FormControlLabel value="text" control={<Radio />} label="Enter New Reference" />
                    } 
                  </RadioGroup>
                </FormControl>
                }

              
              
              <Box>
                {modifyOption === "Auto" &&
                <FormControl fullWidth style={{marginTop: "1em", marginBottom: "1em"}}>
                  <InputLabel id="dropdown-label-msg">Select model</InputLabel>
                  <Select
                    labelId="dropdown-label-msg"
                    value={selectedModel}
                    label="Select Model"
                    onChange={(event) => {setSelectedModel(event.target.value);}}
                  >
                    {models.map((model, index) => (
                      <MenuItem key={index} value={model}>
                        {model}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                }


              { inputType === "document" && documentType === "file"  &&
                <Box>
                  <input
                    accept="*"
                    type="file"
                    id="file-upload-here"
                    style={{ display: "none" }}
                    onChange={handleFileChangeHere}
                    component="span"
                    required
                  />
                  <label htmlFor="file-upload-here" style={{display: "span"}}>
                    <Button variant="contained" component="span" sx={{ fontSize: "0.85em"}}>
                      Select File
                    </Button>
                  </label>
                  <Typography variant="body2" sx={{mt: "0.5em", overflow: "auto"}}><span style={{textDecoration: "underline"}}>Selected file</span>: {file ? file.name : "No file selected" }</Typography>
                </Box>
              }
              { inputType === "document" && documentType === "url" &&
               <Box>
                <Typography variant="h7" sx={{mb: "0.5em", display: "block"}}>Enter Youtube URL</Typography>
                <TextField
                  label="Enter Youtube URL"
                  variant="outlined"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  fullWidth
                  required
                />
                <Typography variant="body2" sx={{mt: "0.5em", overflow: "auto"}}><span style={{textDecoration: "underline"}}>Selected youtube URL</span>: {url }</Typography>
               </Box>
              }
              { inputType === "document" && documentType === "text"  && modifyOption === "Manual" &&
                <TextField
                  id="outlined-basic"
                  label="Enter New Reference"
                  variant="outlined"
                  sx={{my: 1}}
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setVectorStoreContent(e.target.value);
                  }}
                  fullWidth
                  multiline
                  rows={2}
                />
              }
              {
                inputType === "Kiwix" &&
                <Box>
                  <Typography variant="h7" sx={{mb: "0.5em", display: "block"}}>Upload Folder Path</Typography>
                  <Button variant="contained" component="span" sx={{fontSize: "0.85rem"}} onClick={handleSubmitFolder}>
                    Select Folder
                  </Button>
                </Box>
              }
            </Box>
            { inputType === "document"  &&
            <>
              <Typography variant="body2" sx={{mb: "0.5em", overflow: "auto"}}><u>Old reference</u>: {document}</Typography>
              <Button variant="contained" component="span" 
                onClick={handleSubmitFile} 
                sx={{display: "span", fontSize: "0.85em"}}>
              Submit {(documentType === "file") ? "File" : (documentType === "url" ? "Youtube URL" : "Text" )}
              </Button>
            
            
              <span style={{marginLeft: "0.5em", color: (errorResponse === "Success" ? "green" : "red"), fontSize: "1em", marginTop: "0.5em"}}>{errorResponse}</span>
              <Typography variant="body2" sx={{mt: "0.5em", overflow: "auto"}}><u>New reference</u>: {vectorStoreContent}</Typography>
            </>
            }
            <Divider sx={{my: 1}}/>

            <Typography variant="h6" component="h2" >Content</Typography>
            <TextField
              inputRef={TextFieldRef}
              onScroll={handleScroll}
              id="outlined-basic"
              label="Content"
              variant="outlined"
              sx={{my: 1}}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              fullWidth
              multiline 
              rows={10}
              inputProps={{readOnly: (modifyOption === "Manual") ? false : true}}
              // onKeyDown={e => {
              //     if (e.key === "Enter") {
              //       e.preventDefault();
              //       const textarea = e.target;
              //       const start = textarea.selectionStart;
              //       const end = textarea.selectionEnd;
              //       const newValue = content.substring(0, start) + "<br>\n" + content.substring(end);
              //       setContent(newValue);
              //       // Set caret position to after the inserted string
              //       setTimeout(() => {
              //         textarea.selectionStart = textarea.selectionEnd = start + 5; // 5 is length of "<br>\n"
              //       }, 0);
              //     }
              //   }
              // }
            />
            
          </Paper>
          <Typography variant="body2" sx={{height: "1em", color: (errorResponseMsg==="Success" ? "green" : "red"), my: "0.7em"}}>{errorResponseMsg}</Typography>
        
        <div>
            <Button 
            disabled={
              modifyOption === "Auto"
                ? 
                ((inputType === "Kiwix" ? folderPath === "" : (inputType !== "Explain Simply" && inputType !== "Web Search" ? vectorStoreContent === "" : false)) || loading)
                : 
                (question === oldQuestion && content === oldResponse && vectorStoreContent === "" || loading)
            }

            onClick={modifyOption === "Auto" ? handleQueryAuto : handleQueryManual }
            variant='contained' 
            sx={{my: "1em", fontSize: "0.85em"}}
            >
              Submit
            </Button>
        </div>
          
          
        
        </Box>
      </Modal>
    {/* // </div> */}
    </Box>
  );
}