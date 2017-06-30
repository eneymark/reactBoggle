import React, { Component } from 'react';

import './App.css';

const alphabet = 'abcdefghijklmnopqrstuvwxyz';

class App extends Component {

  constructor(props) {
    super(props);
    this.timeout = setTimeout(()=>{
        this.setState({isGameOver:true});
    }, 3*60*1000);
    this.state={board:this.getBoard(4),isGameOver:false,isChecking:false,words:[],last:{},currentWord:'',status:{}};
  }

  getBoard(size) {
      const board = [];
      for(var i=0;i<size;i++){
          const row = [];
          for(var j =0; j<size; j++){
              const letter = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
              row.push({value:letter ==='q'? 'qu' : letter, selected:false});
          }
          board.push(row);
      }
      return board;
  }

  async isWord(word){
      const result = await fetch('https://wordsapiv1.p.mashape.com/words/' + word, {headers:{'X-Mashape-Key':'cJ8aN0pFVVmshhnb0cJB1ThQXlV7p1NCncJjsnj9YlHz82vHPR',
      'Content-Type':'application/json'
      }});
      if(!result || result.status === 404){
          return false;
      }
      if(result.status=== 200){
          return true;
      }
  }

  clearSelections(){
      const board = this.state.board;
      for(const row in board){
          for(const column in board[row]){
              board[row][column].selected = false;
          }
      }
      return board;
  }
  async checkWordClick(event){
      if(this.state.currentWord.length === 0 || this.state.isGameOver){
          return false;
      }
      if(this.state.words.indexOf(this.state.currentWord) ===-1) {
          this.setState({isChecking:true});
          await this.isWord(this.state.currentWord).then(result=>{
              const clearedBoard = this.clearSelections();
              if(result){
                  const words = this.state.words;
                  words.push(this.state.currentWord);
                  this.setState({currentWord:'',last:{},isChecking:false,words:words,status:{success:true}, board:clearedBoard});
              }
              else {
                  this.setState({board:clearedBoard,currentWord:'',last:{},isChecking:false,status:{error:true}});
              }
          });
      }
      else {
          this.setState({status:{error:true}});
      }

  }

  letterClick(event, row, column) {
      if(this.isOKToAdd(row,column)) {
          const currentWord = this.state.currentWord + this.state.board[row][column].value;
          const board = this.state.board;
          board[row][column].selected = true;
          this.setState({currentWord:currentWord, last:{row:row,column:column}, board:board});
      }
  }

  isOKToAdd(row,column) {
      //dont add when checking the word
      if (this.state.isChecking || this.state.isGameOver) {
          return false;
      }
      //dont add when its same as previous
      if (this.state.last.row === row && this.state.last.column === column){
          return false;
      }
      //dont add if its not next to it
      if(this.state.currentWord.length > 0 &&
          (Math.abs(row - this.state.last.row) > 1 || Math.abs(column - this.state.last.column) > 1)){
          return false;
      }
      return true;
  }

  render() {


    return (

        <div className="App">
            <div className="currentWord"><p>{this.state.currentWord}</p><input className="button" type="button" onClick={this.checkWordClick.bind(this)} value="check word"/></div>
            <div className={this.state.isGameOver?'error':''}>{this.state.isGameOver?'time\'s up, game over':''}</div>
            <div className={this.state.status.success?'success':this.state.status.error?'error':''}>{this.state.status.success?'was a word':this.state.status.error?'nope':''}</div>
            <div className="container">
                <table className="board">
                    <tbody>
                    {this.state.board.map((rows, index)=>{
                        const row = rows.map((piece, column)=>{
                            return (
                            <td key={index+''+column} className={piece.selected?'selected':''}>
                                <a href="javascript:void(0)" onClick={event=>{this.letterClick(event, index, column)}}>{piece.value}</a>
                            </td>
                            );
                        });
                        return (
                        <tr key={index}>
                            {row}
                        </tr>
                        )
                    })}
                    </tbody>
                </table>
                <div className="words">
                    <p>points</p>
                    <ul>
                        {this.state.words.map(word=>{
                           return ( <li key={word}>{word} <span className="points">({word.length} pts.)</span></li> )
                        })}
                    </ul>
                </div>
            </div>
      </div>
    );
  }
}

export default App;
