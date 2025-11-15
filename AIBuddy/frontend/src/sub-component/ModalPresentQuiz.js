import * as React from 'react';
import { useState, useEffect } from 'react';
import { Box, Button, Typography, Modal, Divider, IconButton, List, ListItem, Paper, ListItemText} from '@mui/material';
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


export default function ModalPresentQuiz({quizzes}) {


  const [open, setOpen] = useState(false);
  const [tempQuizzes, setTempQuizzes] = useState(shuffleArray([...quizzes]));
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [numberCorrect, setNumberCorrect] = useState(0);
  const [blocked, setBlocked] = useState(false);


  const handleOpen = () => {
    setTempQuizzes(shuffleArray([...quizzes]));    
    setOpen(true);
}
  const handleClose = () => {
    setQuestionNumber(0);
    setSelectedAnswer('');
    setIsAnswerCorrect(null);
    setOpen(false);
    setNumberCorrect(0);
    setBlocked(false);
  }


  useEffect(() => {
    // if(tempQuizzes.length === 0){
    //   handleClose();
    // }
  }, [tempQuizzes])

  useEffect(() => {
    // console.log("isAnswerCorrect:", isAnswerCorrect);
    isAnswerCorrect ? setNumberCorrect(numberCorrect + 1) : null;
  }, [isAnswerCorrect])
  

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

  async function handleChoiceClick(choice, answer, index) {
    if(selectedAnswer === choice){
      setSelectedAnswer('');
      setIsAnswerCorrect(null);
    }
    else{
      setSelectedAnswer(choice);
      setIsAnswerCorrect(choice === answer); // Check if selected answer is correct
    }
    await sleep(800);
    setQuestionNumber(questionNumber + 1);
    // console.log("isCorrect:", isAnswerCorrect);
    let tempQuizzesNew = tempQuizzes.slice(1, tempQuizzes.length);
    setTempQuizzes(shuffleArray(tempQuizzesNew));
    setSelectedAnswer('');
    setIsAnswerCorrect(null);
    setBlocked(false);
    
  };


  


  

  return (
    <Box component={"span"}>
      <Button onClick={handleOpen} sx={{ color: "white", backgroundColor: "rgb(25, 118, 210)", fontSzie: "0.85rem"}}>Present Quiz</Button>
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
            Present Quiz
          </Typography>
          <Divider sx={{my: 1}}/>

          {tempQuizzes.length === 0 &&
           <Box>
                <Typography id="modal-modal-title" variant="h6" component="h2" sx={{fontWeight: 500}}>
                  Grade: {numberCorrect}/{quizzes.length} ({((numberCorrect / quizzes.length) * 100).toFixed(2)})%
                </Typography>    
                <Button 
                onClick={() => {
                    setTempQuizzes(shuffleArray([...quizzes]));
                    setQuestionNumber(0);
                    setSelectedAnswer('');
                    setIsAnswerCorrect(null);
                    setNumberCorrect(0);
                }}
                sx={{ color: "white", backgroundColor: "rgb(25, 118, 210)",fontSzie: "0.85rem"
                }}
                >
                Take it Again
                </Button>
            </Box>
          }
          { tempQuizzes.length > 0 &&
          <div>
            <Paper sx={{ p: 2, display: "display"}}>
              <Typography variant="h6" sx={{ fontWeight: "500" }} component={"span"}>
                {"Q"+String(questionNumber)+": "+tempQuizzes[0]["question"]}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <List>
                {tempQuizzes[0].choices.map((choice, index) => (
                  <ListItem
                    key={index}
                    component={"button"}
                    onClick={() => {
                        if(blocked===false){
                            setBlocked(true);
                            handleChoiceClick(choice, tempQuizzes[0].answer, 0)
                        }

                    }}
                    sx={{
                      // Need to fix this. It shows color of the same choice(s) in diff questions
                      backgroundColor:
                        selectedAnswer === choice 
                          ? isAnswerCorrect
                            ? 'lightgreen'
                            : 'lightcoral'
                          : 'transparent',
                      borderRadius: 1,
                      '&:hover': {
                        backgroundColor: selectedAnswer === choice
                          ? isAnswerCorrect
                            ? '#2eb774'
                            : '#eb5353'
                          : 'lightgray',
                      },
                      cursor: 'pointer',
                    }}
                    // disabled={blocked}
                  >
                    <ListItemText primary={choice} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </div>
          }
      
          {/* <div style={{marginTop: "1em"}}>
            <Button 
            // disabled={question === oldQuestion && JSON.stringify(choices) == JSON.stringify(oldChoices) && answer === oldAnswer} 
            // onClick={handleThread} 
            variant='contained' 
            sx={{my: "1em", fontSize: "0.85em"}}
            >
              Submit
            </Button>
          </div> */}
          
          
        
        </Box>
      </Modal>
    {/* // </div> */}
    </Box>
  );
}