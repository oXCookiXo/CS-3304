using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace TicTacToe.Game
{
    public class GameDetails
    {
        public Guid GameId { get; set; }
        public UserCredential User1Id { get; set; }
        public UserCredential User2Id { get; set; }
        public int[,] GameMatrix { get; set; }
        public string NextTurn { get; set; }
        public string Message { get; set; }

        /// <summary>
        /// 0 = In Progress
        /// 1 = Completed With Result
        /// 2 = Completed, Draw Game
        /// </summary>
        public int GameStatus { get; set; }
        int movecounter = 0;
        int player1counter = 0;
        int player2counter = 0;
           
        public GameDetails()
        {
            GameMatrix = new int[6, 6];
        }

        private string CheckGameStatus()
        {
            string status = CheckRows();
            if (string.IsNullOrEmpty(status))
            {
                status = CheckCols();
            }
            if (string.IsNullOrEmpty(status))
            {
                status = CheckDiagonal();
            }
            Message = !string.IsNullOrEmpty(status) ? status + " wins!" : string.Empty; 
            if (string.IsNullOrEmpty(status))
            {
                status = CheckDraw();
                Message = status; 
            }
            
            return status;
        }

        private string CheckDraw()
        {
            bool isDefault = false;
            for (int row = 0; row < 6; row++)
            {
                for (int col = 0; col < 6; col++)
                {
                    if (GameMatrix[row, col] == default(int))
                    {
                        isDefault = true;
                        GameStatus = 0;
                        break;
                    }
                }
                if (isDefault)
                {
                    break;
                }
            }
            if (!isDefault)
            {
                GameStatus = 2;
            }
            return isDefault ? "In Progress": "Game Drawn";
        }

        public string SetPlayerMove(dynamic rowCol, string currentPlayerId)
        {
            int x = int.Parse(rowCol.row.ToString());
            int y = int.Parse(rowCol.col.ToString());
            
            string returnString = string.Empty;

            if (!string.IsNullOrEmpty(currentPlayerId)
                && GameMatrix[x - 1, y - 1] == default(int))
            {
                if (currentPlayerId == User1Id.UserId)
                {
                    movecounter++;
                    returnString = "O";
                    GameMatrix[x - 1, y - 1] = 1;
                    NextTurn = User2Id.UserId;
                }
                else
                {
                    movecounter++;
                    returnString = "X";
                    GameMatrix[x - 1, y - 1] = 10;
                    NextTurn = User1Id.UserId;
                }
            }
            CheckGameStatus();
            return returnString;
        }

        string CheckRows()
        {
           
            if (movecounter != 36)
            {
                for (int row = 0; row < 6; row++)
                {
                    int rowValue = 0;
                    for (int col = 0; col < 6; col++)
                    {
                        rowValue += GameMatrix[row, col];
                    }
                    if (rowValue == 4)
                    {
                        GameStatus = 0;
                        player1counter++;
                    }
                    else if (rowValue == 40)
                    {
                        GameStatus = 0;
                        player2counter++;
                    }
                }
               
            }
            else
            {
                CheckCols();

            }
            return string.Empty;
        }

        string CheckCols()
        {
            if (movecounter != 36)
            {
                for (int col = 0; col < 6; col++)
                {
                    int colValue = 0;
                    for (int row = 0; row < 6; row++)
                    {
                        colValue += GameMatrix[row, col];
                    }
                    if (colValue == 4)
                    {
                        GameStatus = 1;
                        return User1Id.UserId;
                    }
                    else if (colValue == 40)
                    {
                        GameStatus = 1;
                        return User2Id.UserId;
                    }
                }
            }
            else { CheckDiagonal(); }
            return string.Empty;
        }

        string CheckDiagonal()
        {
            int diagValueF = 0;
            int diagValueB = 0;
            if (movecounter != 36)
            {
                for (int positonF = 0, positonB = 3; positonF < 4; positonF++, positonB--)
                {
                    diagValueF += GameMatrix[positonF, positonF];
                    diagValueB += GameMatrix[positonF, positonB];
                }
                if (diagValueF == 4)
                {
                    GameStatus = 1;
                    return User1Id.UserId;
                }
                else if (diagValueF == 40)
                {
                    GameStatus = 1;
                    return User2Id.UserId;
                }
                if (diagValueB == 4)
                {
                    GameStatus = 1;
                    return User1Id.UserId;
                }
                else if (diagValueB == 40)
                {
                    GameStatus = 1;
                    return User2Id.UserId;
                }
            }
            else
            {
                if (player1counter < player2counter)
                {
                    GameStatus = 1;
                    return User1Id.UserId;
                }
                else { GameStatus = 1;
                    return User2Id.UserId;
                }
            }
            return string.Empty;
        }
    }
}