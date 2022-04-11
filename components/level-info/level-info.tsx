import { useState, useMemo } from "react";
import Link from "next/link";
import cn from "classnames";
import Button from "@mui/material/Button";
import { AiOutlineArrowUp } from "react-icons/ai";
import LevelInfoModal from "../level-info-modal/level-info-modal";
import processExpectedValue from "../../utils/process-expected-value";
import type LevelInfoProps from "./level-info.types";
import * as mui from "./level-info.mui";
import styles from "./level-info.module.css";

interface Answers {
  [key: string]: boolean;
}

function initAnswers(length: number) {
  const array = Array.from({ length }, (_, i) => i + 1);
  return array.reduce((acc: Answers, curr) => {
    acc[curr] = false;
    return acc;
  }, {});
}

function getValueFromStorage(numLevels: number) {
  const answers = localStorage.getItem("answers");
  if (answers === null) {
    const generatedAnswers = initAnswers(numLevels);
    localStorage.setItem("answers", JSON.stringify(generatedAnswers));
    return generatedAnswers;
  }
  return JSON.parse(answers);
}

function computeNumCorrect(answers: Answers) {
  return Object.values(answers).reduce((acc, curr) => (curr ? ++acc : acc), 0);
}

export default function LevelInfo({
  id,
  numLevels,
  editorRef,
  expectedValue,
}: LevelInfoProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [answers, setAnswers] = useState<Answers>(() =>
    getValueFromStorage(numLevels)
  );

  function onOpen() {
    const submittedRawValue = editorRef.current?.getValue() || "";
    const submittedValue = processExpectedValue(submittedRawValue);
    const isAnswerCorrect = submittedValue === expectedValue;
    const newAnswers = { ...answers };
    newAnswers[id] = isAnswerCorrect;
    setAnswers(newAnswers);
    localStorage.setItem("answers", JSON.stringify(newAnswers));
    setIsCorrect(isAnswerCorrect);
    setIsOpen(true);
  }

  function onClose() {
    setIsOpen(false);
  }

  const numCorrect = useMemo(() => computeNumCorrect(answers), [answers]);

  return (
    <>
      <div className={styles.container}>
        <h1>{numCorrect}</h1>
        <Button sx={mui.submit} variant="contained" onClick={onOpen}>
          SUBMIT
        </Button>
        {id !== 1 && (
          <Link href={`/levels/${id - 1}`}>
            <a>
              <div className={cn(styles.iconWrapper, styles.left)}>
                <AiOutlineArrowUp />
              </div>
            </a>
          </Link>
        )}
        {id !== numLevels && (
          <Link href={`/levels/${id + 1}`}>
            <a>
              <div className={cn(styles.iconWrapper, styles.right)}>
                <AiOutlineArrowUp />
              </div>
            </a>
          </Link>
        )}
      </div>
      <LevelInfoModal
        isOpen={isOpen}
        onClose={onClose}
        isCorrect={isCorrect}
        id={id}
      />
    </>
  );
}
