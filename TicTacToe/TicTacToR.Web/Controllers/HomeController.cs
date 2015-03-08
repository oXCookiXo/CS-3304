using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace TicTacToe.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            ViewBag.Message = "Login to Challenge your Friends to a 'Mind-bending' game of Tic-Tac-Toe";
            
            return View();
        }

        public ActionResult About()
        {
           
            return View();
        }
    }
}
