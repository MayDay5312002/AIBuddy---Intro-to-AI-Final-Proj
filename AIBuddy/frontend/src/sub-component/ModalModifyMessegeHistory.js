import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Box, Button, Typography, TextField, Modal, Divider, IconButton, Paper} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import ModalModifyMsg from './ModalModifyMsg.js';
import MarkdownRenderer from './sub-sub-component/MarkdownRenderer.js';



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


export default function ModalModifyMessegeHistory({setResponse,thread_title, refreshMessageHistory, setRefreshMessageHistory, handleSubmitFolder, aiSpace}) {


  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    axios.get("http://127.0.0.1:4192/api/getMessages/"+ "?thread=" + thread_title )
      .then((response) => {
        // console.log(response.data["messages"]);
        setMessages(response.data["messages"]);
        // console.log(messages);
      })
      .catch((error) => {
        console.log(error);
      });
    setOpen(true);
  }

  //use state for current variables
  const [messages, setMessages] = useState([]);
  const [deleteAll, setDeleteAll] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const hasMounted = useRef(false);

  const handleClose = () => {
    setDeleteAll(false);
    setMessages([]);
    setOpen(false);
  }

  useEffect(() => {
    if(!hasMounted.current){
      hasMounted.current = true;
      return;
    }
      axios.get("http://127.0.0.1:4192/api/getMessages/"+ "?thread=" + thread_title )
      .then((response) => {
        // console.log(response.data["messages"]);
        setMessages(response.data["messages"]);
        // console.log(messages);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [thread_title, refreshMessageHistory]);


  const deleteAllMessage = async () =>{
    axios.post("http://127.0.0.1:4192/api/deleteAllMessages/", {"thread": thread_title})
    .then((response) => {
        setMessages([]);
    })
    .catch((error) => {
      console.log(error);
      handleClose();
    });

    setDeleteAll(false);
    
  }

  return (
    <Box>
        <IconButton 
        onClick={handleOpen} 
        disabled= {thread_title === "" ? true : false}
        >
          <HistoryIcon sx={{fontSize: {xs: "1.25rem", md: "1.5rem"}}}/>
        </IconButton>
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
          width: {xs:"80vw", sm: "60vw", lg: "50vw"},
          // height: {xs: "95vh", md: "auto"}
        }}>
            <IconButton 
            onClick={handleClose} 
            sx={{position: "absolute", right: 18}}
            >
              <CloseIcon sx={{fontSize: {xs: "1.25rem", lg: "1.5rem"}}}/>
            </IconButton>
          <Typography 
            id="modal-modal-title" 
            variant="h5" 
            component="h2" 
            sx={{
              fontWeight: 500,
              fontSize: {xs: "1.3rem",md: "1.5rem"},
            }}
          >
            Message History
          </Typography>
          <Divider sx={{my: 1}}/>

          <Paper 
          sx=
          {{p: 1,
          //  maxHeight: {xs:"60vh", sm: "60vh", md: "60vh"},
           maxHeight: "60vh",
           overflow: "auto"
           }}>
            {/* <Typography variant="h6" component="h2" >Message History</Typography> */}
            <Button  variant='contained' sx={{mb: "0.5em", fontSize: "0.85em"}} onClick={() => setDeleteAll(true)}>Delete all Messages</Button>
            {
              deleteAll === true ?
                (
                  <Box sx={{translateY: "-50%", display: "inline-block", pl: "0.5rem"}}>
                    Are you sure?
                    <IconButton 
                      sx={{ margin: "0.2em", cursor: "pointer", "&:hover": { backgroundColor: "#c9c9c9ff" } }}
                      onClick={() => deleteAllMessage()}
                    >
                      <Typography variant="body1" component="p" sx={{ fontSize: "0.6em", translateY: "-50%"}}>Yes</Typography>
                    </IconButton>
                    /
                    <IconButton 
                      sx={{ cursor: "pointer", marginLeft: "0.2em", "&:hover": { backgroundColor: "#c9c9c9ff" } }}
                      onClick={() => setDeleteAll(false)}
                    >
                      <Typography variant="body1" component="p" sx={{ fontSize: "0.6em", translateY: "-50%"}}>No</Typography>
                    </IconButton>
                  </Box>
                )
                : ""
            }
            <Divider sx={{my: 1}}/>
            <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
              {messages.map((message, index) => (
                <Box key={message.id} sx={{display: 'flex', justifyContent: 'space-between'}}>
                  <Paper 
                  sx={{ 
                    p:1, 
                    maxWidth: "100%",
                    overflowWrap: "break-word",
                    minWidth: 0
                  }}>
                    {
                      message.role === "user" ?
                      <Box>
                        <Typography 
                        variant="body1" 
                        component="p" 
                        sx={{ 
                          color: "#0077b6", 
                          cursor: "pointer", 
                          '&:hover': {backgroundColor: "#f3f3f3ff"}, 
                          borderRadius: 1, 
                          p:1,
                          fontSize: {xs: "0.9rem", md: "1rem"},
                          
                        }} 
                        onClick={() => setResponse(messages[index+1].content)}
                        >
                          {message.content} <br/> <u>Content</u>: {message.document} <br/>
                          </Typography>
                        <IconButton 
                          onClick={() => {
                            axios.post("http://127.0.0.1:4192/api/deleteMessage/", {"thread": thread_title, "content": message.content, "document": message.document, "response": messages[index+1].content, id: message.id})
                            .then((response) => {
                              setRefreshMessageHistory(!refreshMessageHistory);
                            })
                            .catch((error) => {
                              console.log(error);
                            });
                          }}
                        >
                          <DeleteIcon sx={{fontSize: {xs: "1.25rem", lg: "1.5rem"}}}/>
                        </IconButton>
                        <ModalModifyMsg thread_title={thread_title} refreshMessageHistory={refreshMessageHistory} 
                        setRefreshMessageHistory={setRefreshMessageHistory} oldQuestion={message.content} 
                        oldResponse={messages[index+1].content} document={message.document} setResponse={setResponse} id={message.id} aiSpace={aiSpace}/>
                      </Box>
                      :
                      <Typography 
                      variant="body1" 
                      component="div"
                      sx={{
                        fontSize: {xs: "0.9rem", md: "1rem"},
                      }}
                      >
                        <MarkdownRenderer>
                        {message.content}
                        </MarkdownRenderer>
                      </Typography>

                    }
                  </Paper>
                </Box>
              ))}
            </Box>
          </Paper>
      
          
          
        
        </Box>
      </Modal>
    {/* // </div> */}
    </Box>
  );
}