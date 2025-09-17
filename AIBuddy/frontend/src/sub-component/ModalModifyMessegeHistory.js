import * as React from 'react';
import { useState, useEffect } from 'react';
import { Box, Button, Typography, TextField, Modal, Divider, IconButton, Paper} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import ModalModifyMsg from './ModalModifyMsg.js';



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


export default function ModalModifyMessegeHistory({setResponse,thread_title, refreshMessageHistory, setRefreshMessageHistory}) {


  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);

  //use state for current variables
  const [messages, setMessages] = useState([]);
  const [deleteAll, setDeleteAll] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const handleClose = () => {
    
    setOpen(false);
  }

  useEffect(() => {
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
    <Box component={"span"}>
      <Box sx={{display: 'flex', justifyContent: 'center', my: "0.5em"}}>
        <IconButton onClick={handleOpen} sx={{}}><HistoryIcon /></IconButton>
      </Box>
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
            Message History
          </Typography>
          <Divider sx={{my: 1}}/>

          <Paper 
          sx=
          {{p: 1,
           maxHeight: {xs:"80vh", sm: "60vh", md: "60vh"},
           overflow: "auto"
           }}>
            {/* <Typography variant="h6" component="h2" >Message History</Typography> */}
            <Button  variant='contained' sx={{mb: "0.5em"}} onClick={() => setDeleteAll(true)}>Delete all Messages</Button>
            {
              deleteAll === true ?
                (
                  <>
                    <IconButton 
                      sx={{ margin: "0.2em", cursor: "pointer", "&:hover": { backgroundColor: "#c9c9c9ff" } }}
                      onClick={() => deleteAllMessage()}
                    >
                      <Typography variant="body1" component="p">Yes</Typography>
                    </IconButton>
                    /
                    <IconButton 
                      sx={{ cursor: "pointer", marginLeft: "0.2em", "&:hover": { backgroundColor: "#c9c9c9ff" } }}
                      onClick={() => setDeleteAll(false)}
                    >
                      <Typography variant="body1" component="p">No</Typography>
                    </IconButton>
                  </>
                )
                : ""
            }
            <Divider sx={{my: 1}}/>
            <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
              {messages.map((message, index) => (
                <Box key={index} sx={{display: 'flex', justifyContent: 'space-between'}}>
                  <Paper sx={{ p:1}}>
                    {
                      message.role === "user" ?
                      <Box>
                        <Typography variant="body1" component="p" sx={{ color: "#0077b6", cursor: "pointer", '&:hover': {backgroundColor: "#f3f3f3ff"}, borderRadius: 1, p:1}} onClick={() => setResponse(messages[index+1].content)}>
                          {message.content} <br/> <u>Content</u>: {message.document} <br/>
                          </Typography>
                        <IconButton 
                        onClick={() => {
                          axios.post("http://127.0.0.1:4192/api/deleteMessage/", {"thread": thread_title, "content": message.content, "document": message.document, "response": messages[index+1].content})
                          .then((response) => {
                            setRefreshMessageHistory(!refreshMessageHistory);
                          })
                          .catch((error) => {
                            console.log(error);
                          });
                        }}
                        >
                          <DeleteIcon />
                        </IconButton>
                        <ModalModifyMsg thread_title={thread_title} refreshMessageHistory={refreshMessageHistory} 
                        setRefreshMessageHistory={setRefreshMessageHistory} oldQuestion={message.content} 
                        oldResponse={messages[index+1].content} document={message.document} setResponse={setResponse}/>
                      </Box>
                      :
                      <Typography variant="body1" component="p" ><span dangerouslySetInnerHTML={{ __html: message.content }} /></Typography>

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