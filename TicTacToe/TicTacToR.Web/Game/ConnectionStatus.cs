using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TicTacToe.Game
{
    public enum ConnectionStatus
    {
        Connected = 0,
        Disconnected,
        Refreshed,
        Challenged,
        Challenging,
        Playing
    }
}
