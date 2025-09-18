import * as React from 'react';
import { useState, useEffect } from 'react';
import { Box, Button, Typography, TextField, Modal, Divider, IconButton} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
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


export default function ModalChangeFlashCard({oldTitle, oldContent, setFlashCards, flashCards, thread_title}) {


  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setTitle(oldTitle);
    setContent(oldContent);
    setOpen(false);
  }

  //use state for current variables
  const [ title , setTitle] = useState(oldTitle);
  const [ content , setContent] = useState(oldContent);

  useEffect(() => {
    setTitle(oldTitle);
    setContent(oldContent);
  }, [oldTitle, oldContent]);

  const handleThread = async () => {
    axios.post("http://127.0.0.1:4192/api/modifyFlashCard/", {"title": title,  "content": content, "thread": thread_title, "oldTitle": oldTitle})
    .then((response) => {
      // setFlashCards(flashCards.map(card => card.title === oldTitle ? {...card, title: title, content: content} : card));
      let index = flashCards.findIndex(card => card.title === oldTitle);
      if(index !== -1){
        let updatedFlashCards = [...flashCards.slice(0, index), {"title": title, "content": content}, ...flashCards.slice(index + 1)];
        setFlashCards(updatedFlashCards);
      }
    })
    .catch((error) => {
      console.log(error);
      handleClose();
    });
    
    handleClose();
  }

  return (
    <Box component={"span"}>
      <IconButton onClick={handleOpen}><EditIcon /></IconButton>
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
            Modify Flash Card
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
            <Button disabled={title === oldTitle && content === oldContent} onClick={handleThread} variant='contained' sx={{my: "1em", fontSize: "0.85rem"}}>Submit</Button>
          </div>
          
          
        
        </Box>
      </Modal>
    {/* // </div> */}
    </Box>
  );
}