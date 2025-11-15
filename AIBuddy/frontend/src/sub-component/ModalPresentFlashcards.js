import * as React from 'react';
import { useState, useEffect } from 'react';
import { Box, Button, Typography, Modal, Divider, IconButton, List, ListItem, Paper, ListItemText} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';


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


export default function ModalPresentFlashcards({flashcards}) {


  const [open, setOpen] = useState(false);
  const [tempFlashcards, setTempFlashcards] = useState(shuffleArray([...flashcards]));
  const [flashcardNumber, setFlashcardNumber] = useState(0); 
  const [numberOfCards, setNumberOfCards] = useState(flashcards.length);


  const handleOpen = () => {
    setTempFlashcards([...flashcards]);    
    setFlashcardNumber(0);
    setNumberOfCards(flashcards.length);
    setOpen(true);
}
  const handleClose = () => {
    setOpen(false);
    setFlashcardNumber(0);
    setNumberOfCards(flashcards.length);
  }


  

    function shuffleArray(array) {
      const newArray = [...array]; // create a copy to avoid mutating original
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]]; // swap
      }
      return newArray;
    }


  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }



  


  

  return (
    <Box component={"span"}>
      <Button onClick={handleOpen} sx={{ color: "white", backgroundColor: "rgb(25, 118, 210)", fontSzie: "0.85rem"}}>Present Flashcards</Button>
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
          width: {xs:"80vw", sm: "60vw", md: "40vw"},
          maxHeight: {xs:"80vh", sm: "60vh", md: "70vh"},
          overflow: "auto",

        }}>
          <IconButton onClick={handleClose} sx={{position: "absolute", right: 18}}><CloseIcon /></IconButton>
          <Typography id="modal-modal-title" variant="h5" component="h2" sx={{fontWeight: 500}}>
            Present Flashcards
          </Typography>
          <Divider sx={{my: 1}}/>

          { tempFlashcards.length > 0 &&
          <Box sx={{display: "flex"}}>
            <IconButton 
            sx={{borderRadius: "0.2em"}}
            onClick={()=>{
                if(flashcardNumber > 0){setFlashcardNumber(flashcardNumber - 1)};
            }}
            >
                <ChevronLeftIcon />
            </IconButton>
            <Paper sx={{ p: 2, display: "span", maxHeight: {xs:"71vh", sm: "51vh", md: "61vh"}, overflow: "auto", flex: 1}}>
              <Typography variant="h6" sx={{ fontWeight: "500" }} component={"span"}>
                {tempFlashcards[flashcardNumber].title}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body1" sx={{ fontWeight: "500" }} component={"span"}>
                {tempFlashcards[flashcardNumber].content}
              </Typography>
            </Paper>
            <IconButton 
            sx={{borderRadius: "0.2em"}}
            onClick={()=>{
                if(flashcardNumber < numberOfCards-1){setFlashcardNumber(flashcardNumber + 1)};
            }}
            >
                <ChevronRightIcon />
            </IconButton>
          </Box>
          }
      
          
          
        
        </Box>
      </Modal>
    </Box>
  );
}