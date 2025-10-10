import * as React from 'react';
import { useState, useEffect } from 'react';
import { Box, Button, Typography, TextField, Modal, Divider, IconButton, List, ListItem} from '@mui/material';
import AddBoxSharpIcon from '@mui/icons-material/AddBoxSharp';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DangerousIcon from '@mui/icons-material/Dangerous';
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


export default function ModalAddQuiz({setQuizzes, thread_title, setNewQuizzes}) {


  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);

  //use state for current variables
  const [ question , setQuestion] = useState('');
  const [ choices, setChoices] = useState(['']);
  const [ answer , setAnswer] = useState('');

  const handleClose = () => {
    setQuestion('');
    setAnswer('');
    setChoices(['']);
    setOpen(false);
  }

  const handleThread = async () => {
    axios.post("http://127.0.0.1:4192/api/createManualQuiz/", {"question": question,  "choices": choices, "answer": answer, "thread": thread_title})
    .then((response) => {
      // setQuizzes([...quizzes, {"question": question, "answer": answer, "choices": choices}]);
      axios.get('http://127.0.0.1:4192/api/getQuizzes/?thread=' + thread_title)
      .then((response) => {
        setQuizzes(response.data["quizzes"]);
        setNewQuizzes(true);
        handleClose();
      })
      .catch((error) => {
        console.log(error);
        handleClose();
      });

    })
    .catch((error) => {
      console.log(error);
      handleClose();
    });
    
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
          width: {xs:"80vw", sm: "60vw", md: "40vw"},
          maxHeight: {xs:"80vh", sm: "60vh", md: "70vh"},
          overflow: "auto",

        }}>
          <IconButton onClick={handleClose} sx={{position: "absolute", right: 18}}><CloseIcon /></IconButton>
          <Typography id="modal-modal-title" variant="h5" component="h2" sx={{fontWeight: 500}}>
            Add Quiz
          </Typography>
          <Divider sx={{my: 1}}/>


          <div>
            <Typography variant="h6" component="h2" >Quiz Question</Typography>
            <TextField id="Card Question" label="Card Question" value={question} onChange={(e) => setQuestion(e.target.value)} variant="filled" required fullWidth multiline rows={3}/>
          </div>

          <div>
            <Typography variant="h6" component="h2" sx={{mt: "0.5em"}} >Quiz Choices</Typography>
            <IconButton>
              <AddBoxSharpIcon onClick={() => setChoices([...choices, ""])}/>
            </IconButton>
            <List> 
              {choices.map((choice, index) => (
                <ListItem
                  key={index}
                  sx={{
                    px: 0,
                    // py: 0,
                  }}
                >
                  <TextField
                    id={`choice-${index}`}
                    label={`Choice ${index + 1}`}
                    value={choice}
                    onChange={(e) => {
                      const newChoices = [...choices];
                      if(answer === newChoices[index]) setAnswer(e.target.value);
                      newChoices[index] = e.target.value;
                      setChoices(newChoices);
                    }}
                    variant="filled"
                    required
                    fullWidth
                    multiline
                    rows={1}
                  />
                  <IconButton
                    onClick={() => {
                      // setChoices( choices.filter((_, i) => i !== index) );
                      if(choices.length > 1){
                      let newChoices = choices.filter((_, i) => i !== index);
                      handleDeleteChoice(newChoices);
                      // setQuizzes( [...quizzes.splice(index, 1), {"question": question, "answer": answer, "choices": newChoices}, ...quizzes.splice(index+1)] );
                      }
                    }}
                    sx={{mx: "0.2em"}}
                  >
                    <DeleteIcon />
                  </IconButton>
                  <IconButton onClick={
                    () => {
                      if(choice !== answer) setAnswer(choice);
                      else setAnswer("");
                    }}>
                    {
                      (choice === answer) ?
                        <CheckCircleIcon sx={{color: "green"}}/>
                      :
                        <DangerousIcon sx={{color: "red"}}/>
                    }
                  </IconButton> 
                </ListItem>
              ))

              }
            </List>
          </div>
      
          <div style={{marginTop: "1em"}}>
            <Button disabled={question === '' || choices.length === 0} onClick={handleThread} variant='contained' sx={{my: "1em", fontSize: "0.85rem"}}>Submit</Button>
          </div>
          
          
        
        </Box>
      </Modal>
    {/* // </div> */}
    </Box>
  );
}