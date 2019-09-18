import React, { Component } from 'react';
import Scores from './Scores';
import UserSettings from './UserSettings';
import { IconRestart } from './Icon';
import { Link } from 'react-router-dom';
import { Tooltip } from 'react-tippy';
import 'react-tippy/dist/tippy.css'

class Finished extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newTopSpeed: false
    }
  }

  componentDidMount() {
    let wpm = this.calculateScores(this.props.timer, this.props.totalNumberOfMatchedWords);

    this.props.updateFinishedLessonsCount();

    if (this.props.topSpeed < wpm) {
      this.props.updateTopSpeed(wpm);
      this.setState({ newTopSpeed: true });
    }
    else {
      this.setState({ newTopSpeed: false });
    }

    if (this.finishedHeading) {
      this.finishedHeading.focus();
    }
  }

  isEmpty() {
    return (this.props.lessonLength === 0);
  }

  calculateScores(timer, totalNumberOfMatchedWords) {
    let wordsPerMinute;
    if (this.props.timer > 0) {
      wordsPerMinute = Math.round(totalNumberOfMatchedWords/(timer/60/1000));
    } else {
      wordsPerMinute = 0;
    }
    return wordsPerMinute;
  }

  render() {
    let customMessage;
    let accuracy = '';
    let currentLessonStrokes = this.props.currentLessonStrokes;
    // console.log(currentLessonStrokes);

    let misstrokesSummary = '';
    let strokeAttemptsPresentation;

    let wordsTyped = '';

    if (this.props.currentLessonStrokes && this.props.currentLessonStrokes.length >= 0) {
      let pluralisedString = '' + this.props.currentLessonStrokes.length + ' words typed';

      if (this.props.currentLessonStrokes.length === 1) {
        pluralisedString = '' + this.props.currentLessonStrokes.length + ' word typed';
      }

      wordsTyped = (
        <span className="nowrap">{pluralisedString}</span>
      );
    }

    if (currentLessonStrokes.length > 0) {
      let listOfPossibleStrokeImprovements = currentLessonStrokes.map( (phrase, i) => {
        let strokeAttempts = phrase.attempts.map( ( attempt, j ) => {
          return(
              <li key={ j } className="nowrap di ml1"><span className="bg-warning px1">{attempt}</span></li>
          );
        });
        if (phrase.attempts.length > 0) {
          strokeAttemptsPresentation = (
            <span>
              <p className="visually-hidden di"><span className="visually-hidden">You wrote: </span></p>
              <ol className="unstyled-list mb0 misstroke-list di">
                {strokeAttempts}
              </ol>
            </span>
          );
        } else {
          strokeAttemptsPresentation = [];
        }
        return(
          <li key={ i } className="unstyled-list-item bg-slat p1 mb1 overflow-scroll">
            <label className="checkbox-label mt0">
              <input
                className="checkbox-input"
                type="checkbox"
                name={ i + "-checkbox" }
                id={ i + "-checkbox" }
                checked={this.props.currentLessonStrokes[i].checked}
                onChange={this.props.updateRevisionMaterial}
                />
                <span className="matched steno-material px1 nowrap">{phrase.word}</span>
            </label>
            {strokeAttemptsPresentation}
            <p className="pl3 mb0"><span className="visually-hidden text-small">Hint: </span><span className="steno-stroke steno-stroke--subtle text-small px1 py05">{phrase.stroke.split('').map((item, i)=><kbd className="raw-steno-key raw-steno-key--subtle text-small" key={i}>{item}</kbd>)}</span></p>
          </li>
        );
      });

      misstrokesSummary = (
        <React.Fragment>
          <div>
            <h4 className="mt3 nowrap">Possible stroke improvements</h4>
            <p>
              <a href={this.props.path} onClick={this.props.reviseLesson} role="button">
                Revise these words</a>
            </p>
            <ol className="mb0 unstyled-list">{listOfPossibleStrokeImprovements}</ol>
          </div>
          <p>
            <a href={this.props.path} onClick={this.props.reviseLesson} role="button">
              Revise these words</a>
          </p>
        </React.Fragment>
      );
    }

    if (this.props.totalNumberOfMistypedWords === 0 && this.props.totalNumberOfHintedWords === 0) {
      accuracy = '100% accurate!';
    }
    else if (this.props.totalNumberOfMistypedWords > 0) {
      // console.log("this.props.totalNumberOfNewWordsMet" + this.props.totalNumberOfNewWordsMet);
      // console.log("this.props.totalNumberOfLowExposuresSeen" + this.props.totalNumberOfLowExposuresSeen);
      // console.log("this.props.totalNumberOfRetainedWords" + this.props.totalNumberOfRetainedWords);
      // console.log("this.props.totalNumberOfHintedWords" + this.props.totalNumberOfHintedWords);
      // console.log("this.props.totalNumberOfMistypedWords" + this.props.totalNumberOfMistypedWords);
      //
      // Test for stopping the lesson before the end
      let accuracyPercent;
      if (this.props.currentLessonStrokes && this.props.currentLessonStrokes.length > 0) { // avoid division by zero
        accuracyPercent = (1 - ((this.props.totalNumberOfMistypedWords) / this.props.currentLessonStrokes.length)) * 100;
      } else { // this should never happen because first `if` code path handles zero state
        accuracyPercent = 100.0;
      }
      // console.log("Accuracy percent: " + accuracyPercent);
      let accuracyPercentRoundedToTwoDecimalPlaces = (Math.floor(accuracyPercent * 100) / 100);
      // console.log("Accuracy percent rounded: " + accuracyPercentRoundedToTwoDecimalPlaces);
      accuracy = '' + accuracyPercentRoundedToTwoDecimalPlaces + '% accuracy';
    }
    else if (this.props.totalNumberOfHintedWords >= 1) {
      accuracy = accuracy + '100% accurate! ';
    }
    else {
      accuracy = ' Keep it up!';
    }

    let hints = "0 hints";
    if (this.props.totalNumberOfHintedWords === 1) {
      hints = this.props.totalNumberOfHintedWords + " hint";
    }
    else if (this.props.totalNumberOfHintedWords > 1) {
      hints = this.props.totalNumberOfHintedWords + " hints";
    }

    // When you have stroked nothing right, except hinted or misstroked words, show nothing instead of 0%
    if (accuracy === '0% accuracy!') {
      accuracy = '';
    }
    let emptyAndZeroStateMessage = '';
    let wpm = this.calculateScores(this.props.timer, this.props.totalNumberOfMatchedWords);
    if (wpm === 0) {
      accuracy = 'Keep trying!';
    }

    let wpmCommentary = '';
    if (wpm > 5000) {
      wpmCommentary = 'Faster than you can think…';
    } else if (wpm > 1500) {
      wpmCommentary = 'Faster than a speed reader!';
    } else if (wpm > 300) {
      wpmCommentary = 'Faster than you can read!';
    } else if (wpm > 250) {
      wpmCommentary = 'As fast as an auctioneer!';
    } else if (wpm > 225) {
      wpmCommentary = 'Faster than a pro stenographer!';
    } else if (wpm > 160) {
      wpmCommentary = 'Faster than a stenographer!';
    } else if (wpm > 150) {
      wpmCommentary = 'Faster than you can talk!';
    } else if (wpm > 100) {
      wpmCommentary = 'Faster than a stenotype student!';
    } else if (wpm > 80) {
      wpmCommentary = 'Faster than a pro typist!';
    } else if (wpm > 60) {
      wpmCommentary = 'Faster than a good QWERTY typist!';
    } else if (wpm > 40) {
      wpmCommentary = 'Faster than your average typist!';
    } else if (wpm > 27) {
      wpmCommentary = 'Faster than hunt and peck typists';
    } else if (wpm > 22) {
      wpmCommentary = 'Faster than Morse code';
    } else if (wpm > 20) {
      wpmCommentary = 'Faster than handwriting';
    } else {
      wpmCommentary = 'Practice this lesson again';
    }

    let newTopSpeedSectionOrFinished = "Finished: " + this.props.lessonTitle;

    if (this.state.newTopSpeed && this.props.finishedLessonsCount > 1) {
      newTopSpeedSectionOrFinished = "New top speed for today!";
      wpmCommentary = this.props.lessonTitle;
    }

    let lessonSummary = (
      <div className="finished-lesson mr1 mw-1024 overflow-hidden">
        <div className="finished-summary mb3 text-center">
          <h3
            className="negative-outline-offset dib text-center mt3"
            ref={(finishedHeading) => { this.finishedHeading = finishedHeading; }} tabIndex="-1" id="finished-heading">
            {newTopSpeedSectionOrFinished}
          </h3>
          <p>{wpmCommentary}</p>
          <ul className="inline-flex flex-wrap middot-separator unstyled-list">
            <li className="ml0 bg-warning pl1 pr1">
              {wpm}&nbsp;
              <Tooltip
                animation="shift"
                arrow="true"
                className="abbr"
                duration="200"
                tabIndex="0"
                tag="abbr"
                theme="didoesdigital"
                title="words per minute"
                trigger="mouseenter focus click"
                onShow={this.props.setAnnouncementMessage}
              >WPM</Tooltip>
            </li>
            <li className="ml0">
              <span className="nowrap">{accuracy}</span>
            </li>
            <li className="ml0">
              <span className="nowrap">{hints}</span>
            </li>
            <li className="ml0">
              <span className="nowrap">{wordsTyped}</span>
            </li>
          </ul>
          <p className="mb12">
            <a href={process.env.PUBLIC_URL + this.props.path} onClick={this.props.restartLesson} className="mr3" role="button">
              <IconRestart ariaHidden="true" role="presentation" iconFill="#596091" className="mr1 svg-icon-wrapper svg-baseline" />
              Restart lesson</a>
            <Link to={this.props.suggestedNext} className="link-button dib negative-outline-offset" style={{lineHeight: 2}} role="button">
              Next lesson
            </Link>
          </p>
        </div>
        <div className="misstrokes-summary">
          {misstrokesSummary}
        </div>
      </div>
    );

    let lessonEmpty = false;
    if (this.isEmpty()) {
      lessonEmpty = true;
      emptyAndZeroStateMessage = (
        <div className="text-center mt10 mx-auto">There are no words to write.</div>
      );
      lessonSummary = '';
    } else {
      lessonEmpty = false;
    }
    if (this.props.settings && this.props.settings.customMessage) {
      customMessage = <h3 className='px3 pb0 mb0'>{this.props.settings.customMessage}</h3>;
    } else {
      customMessage = ''
    }
    return (
      <main id="main">
        <div className="mx-auto mw-1024">
          {customMessage}
        </div>
        <div className="mx-auto mw-1024 p3">
          <div className="scores mb3">
            <Scores
              setAnnouncementMessage={this.props.setAnnouncementMessage}
              timer={this.props.timer}
              totalNumberOfMatchedWords={this.props.totalNumberOfMatchedWords}
              totalNumberOfNewWordsMet={this.props.totalNumberOfNewWordsMet}
              totalNumberOfLowExposuresSeen={this.props.totalNumberOfLowExposuresSeen}
              totalNumberOfRetainedWords={this.props.totalNumberOfRetainedWords}
              totalNumberOfMistypedWords={this.props.totalNumberOfMistypedWords}
              totalNumberOfHintedWords={this.props.totalNumberOfHintedWords}
            />
          </div>
          <div className="lesson-canvas lesson-canvas--finished panel p3 overflow-scroll mb3">
            <div className={lessonEmpty ? 'dc' : 'w-100'}>
              {emptyAndZeroStateMessage}
              {lessonSummary}
            </div>
          </div>
          <UserSettings
            changeUserSetting={this.props.changeUserSetting}
            changeSortOrderUserSetting={this.props.changeSortOrderUserSetting}
            changeSpacePlacementUserSetting={this.props.changeSpacePlacementUserSetting}
            changeShowStrokesAs={this.props.changeShowStrokesAs}
            changeShowStrokesOnMisstroke={this.props.changeShowStrokesOnMisstroke}
            changeStenoLayout={this.props.changeStenoLayout}
            chooseStudy={this.props.chooseStudy}
            disableUserSettings={this.props.disableUserSettings}
            handleLimitWordsChange={this.props.handleLimitWordsChange}
            handleStartFromWordChange={this.props.handleStartFromWordChange}
            handleRepetitionsChange={this.props.handleRepetitionsChange}
            hideOtherSettings={this.props.hideOtherSettings}
            maxStartFromWord={this.props.lessonLength}
            path={this.props.path}
            revisionMode={this.props.revisionMode}
            setAnnouncementMessage={this.props.setAnnouncementMessage}
            toggleHideOtherSettings={this.props.toggleHideOtherSettings}
            totalWordCount={this.props.totalWordCount}
            userSettings={this.props.userSettings}
          />
        </div>
      </main>
    )
  }

}

export default Finished;
