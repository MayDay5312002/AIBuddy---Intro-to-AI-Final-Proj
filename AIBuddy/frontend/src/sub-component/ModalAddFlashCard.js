import * as React from 'react';
import { useState, useEffect } from 'react';
import { Box, Button, Typography, TextField, Modal, Divider, IconButton} from '@mui/material';
import AddBoxSharpIcon from '@mui/icons-material/AddBoxSharp';
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close';



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


export default function ModalAddFlashCard({setFlashCards, flashCards, thread_title}) {


  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);

  //use state for current variables
  const [ title , setTitle] = useState('');
  const [ content , setContent] = useState('');

  const handleClose = () => {
    setTitle('');
    setContent('');
    setOpen(false);
  }

  const handleThread = async () => {
    axios.post("http://127.0.0.1:8000/api/createManualFlashCard/", {"title": title,  "content": content, "thread": thread_title})
    .then((response) => {
      // setFlashCards(flashCards.map(card => card.title === oldTitle ? {...card, title: title, content: content} : card));
      setFlashCards([...flashCards, {"title": title, "content": content}]);
    })
    .catch((error) => {
      console.log(error);
      handleClose();
    });
    
    handleClose();
  }

  return (
    <Box component={"span"}>
      <Box sx={{display: 'flex', justifyContent: 'center', my: "0.5em"}}>
        <IconButton onClick={handleOpen} sx={{}}><AddBoxSharpIcon /></IconButton>
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
            Add Flash Card
          </Typography>
          <Divider sx={{my: 1}}/>


          <div>
            <Typography variant="h6" component="h2" >Card Title</Typography>
            <TextField id="Card Title" label="Card Title" value={title} onChange={(e) => setTitle(e.target.value)} variant="filled" required fullWidth multiline rows={1}/>
          </div>

          <div>
            <Typography variant="h6" component="h2" >Card Content</Typography>
            <TextField 
            id="Card Content" 
            label="Card Content" 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            variant="filled" 
            sx={{height: "5em"}} 
            multiline
            rows={4}
            required 
            fullWidth/>
          </div>
      
          <div style={{marginTop: "3em"}}>
            <Button disabled={title === '' || content === ''} onClick={handleThread} variant='contained' sx={{my: "1em"}}>Submit</Button>
          </div>
          
          
        
        </Box>
      </Modal>
    {/* // </div> */}
    </Box>
  );
}