import React, { ReactElement, useCallback, useEffect, useMemo, useState } from "react";
import useAccount from "hooks/useAccount";
import { Alert, Box, Chip, Grid, styled, Typography, Button } from "@mui/material";
import { IStepProps } from "../types";
import useBreakpoint from "hooks/useBreakpoint";

interface IReEntryChipProps {
  onClickFn: Function;
  onDeleteFn: Function;
  labelText: string;
}

const ReEntryChip: React.FC<IReEntryChipProps> = ({ onClickFn, onDeleteFn, labelText }) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = useCallback(() => {
    onClickFn(labelText);
    setIsClicked((prev) => !prev);
  }, [onClickFn, labelText]);

  const handleDelete = useCallback(() => {
    onDeleteFn(labelText);
    setIsClicked((prev) => !prev);
  }, [onDeleteFn, labelText]);

  return isClicked ? (
    <StyledChip onClick={handleClick} label={labelText} onDelete={handleDelete} />
  ) : (
    <StyledChip onClick={handleClick} label={labelText} />
  );
};

const ReEnterSeedStep: React.FC<IStepProps> = ({ stepForwardFn }) => {
  const { accountSeed } = useAccount();
  const [reEntryText, setReEntryText] = useState<Array<string>>();
  const [isReEnteredCorrectly, setIsReEnteredCorrectly] = useState(false);
  const [wordList, setWordList] = useState<Array<string>>();
  const isSmallBrowser = useBreakpoint("<", "sm");
  const [reEntryCounter, setReEntryCounter] = useState<number | undefined>(0);

  // DEV USE
  // skips past the re-entry step for convenience
  // useEffect(() => {
  //   setIsReEnteredCorrectly(true); // sets it like the user has picked their words properly in re-entry step
  //   // stepForwardFn(); // steps past this step altogether without having to re-enter words
  // }, [stepForwardFn]);

  // adds to reEntryText when a user clicks chips
  const reEntryChipClickFn = useCallback((label: string) => {
    setReEntryText((prev) => {
      let newArray: Array<string> = [];
      if (prev === undefined) {
        prev = [];
      }
      const len = prev?.length || 0;

      // the user has already re-entered this word
      if (prev.includes(label)) {
        return prev;
      }
      newArray = [...prev, label];
      return newArray;
    });
  }, []);

  // removes from reEntryText when a user clicks the "X" on chips
  const reEntryDeleteFn = useCallback((label: string) => {
    setReEntryText((prev) => {
      let newArray: Array<string> = [];

      if (prev === undefined) {
        return [];
      }

      const len = prev?.length || 0;
      // they've clicked the last label in the array, this is the only condition we want to allow
      // the user to remove the word
      if (prev[len - 1] === label) {
        newArray = [...prev.slice(0, len - 1)];
        return newArray;
      }

      // otherwise we give them the same array back
      return prev;
    });
  }, []);

  const AlertReEntryStatus = useMemo(() => {
    if (reEntryCounter === undefined) {
      return <></>;
    }

    // user has reentered all words but they're not matching the original
    if (isReEnteredCorrectly === false && reEntryCounter === 12) {
      return (
        // TODO: conditionally render the warning (don't display as the user is re-entering until they have entered all 12 words)
        <Alert severity="error">Incorrect seed re-entry, please double check your seed.</Alert>
      );
    }

    // they aren't done entering all of the words yet
    if (reEntryCounter < 12) {
      return <Alert severity="info">You have entered {reEntryCounter} words out of 12.</Alert>;
    }

    return (
      <>
        <Alert severity="success">Seed correctly re-entered, you may now proceed.</Alert>
        <StyledButton
          variant="contained"
          onClick={() => {
            stepForwardFn();
          }}
        >
          Continue
        </StyledButton>
      </>
    );
  }, [isReEnteredCorrectly, stepForwardFn, reEntryCounter]);

  // create chips for each word in the accountSeed and shuffle them before displaying
  // change so seedToWordArray() is called by a useEffect with accountSeed as its dep
  // put shuffled word list into state
  const WordChips: Array<ReactElement> | React.ReactFragment = useMemo(() => {
    if (wordList === undefined) {
      return <></>;
    }

    return wordList?.map((item, index) => {
      return (
        <Grid item xs={4} sm={3} key={item + index}>
          <ReEntryChip labelText={item} onClickFn={reEntryChipClickFn} onDeleteFn={reEntryDeleteFn} />
        </Grid>
      );
    });
  }, [reEntryChipClickFn, wordList, reEntryDeleteFn]);

  // whenever reEntryText changes, reruns to see if matching condition is met yet and updates current counter
  useEffect(() => {
    const reEntryLength = reEntryText?.length;

    setReEntryCounter(reEntryLength);
    if (reEntryText?.join(" ") === accountSeed) {
      setIsReEnteredCorrectly(true);
    }
  }, [reEntryText, accountSeed, reEntryCounter]);

  useEffect(() => {
    if (accountSeed === undefined) {
      return;
    }
    const wl = seedToWordArray(accountSeed);
    shuffleWordlist(wl); // shuffles the wordlist in-line
    // set shuffled word list state here from wordlist (post-shuffle)
    setWordList(wl);
  }, [accountSeed]);

  if (!accountSeed) {
    return (
      <>
        <Typography>No seed present, something went wrong. Please go back and try again.</Typography>
      </>
    );
  }

  return (
    <>
      <Typography>
        Your words are displayed below. Click them in the order you wrote them down to confirm you've backed up your seed correctly. You can click a
        word again to remove it if you make a mistake.
      </Typography>
      <StyledGridContainer sx={{ width: isSmallBrowser === true ? "100%" : "80%" }} spacing={0} container justifyContent="center" alignItems="center">
        {WordChips}
      </StyledGridContainer>
      <StyledReEntryDisplay>{reEntryText?.join(" ")}</StyledReEntryDisplay>
      {AlertReEntryStatus}
    </>
  );
};

const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  width: "40%",
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  width: "100px",
  margin: "10px",
}));

const StyledReEntryDisplay = styled(Box)(({ theme }) => ({
  backgroundColor: "red",
}));

const StyledGridContainer = styled(Grid)(({ theme }) => ({
  color: theme.palette.primary.contrastText,
  margin: "auto",
  maxWidth: "500px",
}));

//
// helper functions
//

function seedToWordArray(seed: string) {
  return seed.split(" ") as Array<string>;
}

function shuffleWordlist(array: Array<string>) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

export default React.memo(ReEnterSeedStep);
