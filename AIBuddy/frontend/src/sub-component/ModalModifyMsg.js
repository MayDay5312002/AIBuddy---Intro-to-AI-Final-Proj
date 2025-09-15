import * as React from 'react';
import { useState, useEffect } from 'react';
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


export default function ModalModifyMsg({setResponse,thread_title, refreshMessageHistory, setRefreshMessageHistory, oldResponse, oldQuestion, document}) {


  const [open, setOpen] = useState(false);
  //use state for current variables
  const [content, setContent] = useState(oldResponse);
  const [question, setQuestion] = useState(oldQuestion);
  const [file, setFile] = useState(null);
  const [inputType, setInputType] = useState("file");
  const [url, setUrl] = useState("");
  const [vectorStoreContent, setVectorStoreContent] = useState("");
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');

  const [errorResponse, setErrorResponse] = useState("");
  const [errorResponseMsg, setErrorResponseMsg] = useState('');
  const [modifyOption, setModifyOption] = useState('Auto');
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    axios.get('http://localhost:4192/api/models/').then((response) => {
      setModels(response.data["models"]);
      setSelectedModel(response.data["models"][0]);
    })
    .catch((error) => {
        console.error("Error uploading file:", error);
    })
  }, [open])
  

  const handleOpen = () => {
    setOpen(true);
  }
  const handleClose = () => {
    setContent(oldResponse);
    setQuestion(oldQuestion);
    setFile(null);
    setInputType("file");
    setUrl("");
    setVectorStoreContent("");
    setOpen(false);
    setErrorResponse("");
    setErrorResponseMsg('');
    setModifyOption('Auto');
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

  const handleSubmitFile = () => {
    setErrorResponse(<CircularProgress size={20} />)
    setVectorStoreContent("");
    setLoading(true);
    const formData = new FormData();
    if(inputType === "file"){
      if(file===null){
        console.log("Please select a file");
        return
      }
      formData.append("file", file);
    }
    else if(inputType === "url"){
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
      setVectorStoreContent(inputType === "file"? file.name : url);
      setErrorResponse("Success");
      setLoading(false);
    })
    .catch(error => {
      // Handle any errors that occurred during the request
      setErrorResponse("Error uploading file");
      console.error(error);
    });
  }

  const handleQueryAuto = () => {
      let oldDocumentNew = (document.includes("youtube") || document.includes("youtu.be")) ? document.replace("&", "%26") : document //need to replace & with %26 to avoid error
      const eventSource = new EventSource('http://localhost:4192/api/modifyMessage/' + '?query=' + question + '&model=' + selectedModel + '&thread=' + thread_title + 
      '&oldQuestion=' + oldQuestion + '&oldDocument=' + oldDocumentNew + '&oldResponse=' + oldResponse + "&newDocument=" + (inputType === "file"? file.name : url.replace("&", "%26"))
      );
      setContent('');
      setResponse(''); // clear old response
      setGenerating(true);
      setErrorResponseMsg(<CircularProgress size={18} />)
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
    axios.post("http://localhost:4192/api/modifyMessageManual/", {"thread": thread_title, "oldQuestion": oldQuestion, "oldResponse": oldResponse, "query": question, "newResponse": content, "oldDocument": document, "newDocument": (vectorStoreContent === "") ? document : (inputType === "file" ? file.name : url.replace("&", "%26"))})
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
            setModifyOption(modifyOption === "Manual" ? "Auto" : "Manual");
          }}
           component="span" style={{marginTop: "0.5em", marginBottom: "0.5em"}}>{modifyOption}</Button>
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

              <Typography variant="h6" component="h2" sx={{mb: "0.5em", display: "block", }}>{inputType === "file" ? "Upload file" : "Upload youtube URL"}</Typography>
                <FormControl>
                  <FormLabel>Choose Input Type</FormLabel>
                  <RadioGroup
                    row
                    value={inputType}
                    onChange={(event => {setInputType(event.target.value)})}
                  >
                    <FormControlLabel value="file" control={<Radio />} label="Upload a File" />
                    <FormControlLabel value="url" control={<Radio />} label="Enter a youtube URL" />
                  </RadioGroup>
                </FormControl>
              
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


              { inputType === "file" ?
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
                  <Button variant="contained" component="span">
                    Select File
                  </Button>
                </label>
                <Typography variant="body2" sx={{mt: "0.5em", overflow: "auto"}}><span style={{textDecoration: "underline"}}>Selected file</span>: {file ? file.name : "No file selected" }</Typography>
              </Box>
               :
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
            </Box>
            <Typography variant="body2" sx={{mb: "0.5em", overflow: "auto"}}><u>Old reference</u>: {document}</Typography>
            <Button variant="contained" component="span" 
              onClick={handleSubmitFile} 
              sx={{display: "span"}}>
            Submit {(inputType === "file") ? "File" : "Youtube URL"}
            </Button>
            <span style={{marginLeft: "0.5em", color: "green", fontSize: "1em"}}>{errorResponse}</span>
            <Typography variant="body2" sx={{mt: "0.5em", overflow: "auto"}}><u>New reference</u>: {vectorStoreContent}</Typography>

            <Divider sx={{my: 1}}/>

            <Typography variant="h6" component="h2" >Content</Typography>
            <TextField
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
            />
            
          </Paper>
          <Typography variant="body2" sx={{height: "1em", color: (errorResponseMsg==="Success" ? "green" : "red"), my: "0.7em"}}>{errorResponseMsg}</Typography>
        
        <div>
            <Button 
            disabled={
              modifyOption === "Auto"
                ? (vectorStoreContent === "" || loading)
                : (question === oldQuestion && content === oldResponse && vectorStoreContent === "" || loading)
            }

            onClick={modifyOption === "Auto" ? handleQueryAuto : handleQueryManual }
            variant='contained' 
            sx={{my: "1em"}}
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