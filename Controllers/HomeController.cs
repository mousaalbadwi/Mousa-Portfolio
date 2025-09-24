using Microsoft.AspNetCore.Mvc;
using MousaPortfolio.Models;
using MousaPortfolio.Services;
using System.Diagnostics;

namespace MousaPortfolio.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult About()
        {
            return View();
        }


        // === اختبار الإيميل بشكل مباشر ===
        [HttpGet]
        public async Task<IActionResult> TestEmail([FromServices] IMailService mail)
        {
            try
            {
                var ok = await mail.SendContactAsync("Test User", "test@example.com", "Test Subject", "Hello from portfolio");
                return Content(ok ? "OK (email sent)" : "FAILED (see server logs)");
            }
            catch (Exception ex)
            {
                return Content("EXCEPTION: " + ex.ToString());
            }
        }

        // === GET Contact (اختياري لو عملت صفحة منفصلة) ===
        [HttpGet]
        public IActionResult Contact()
        {
            return View(); // حالياً النموذج في Index.cshtml
        }

        // === POST Contact (الفورم) ===
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Contact(ContactFormModel m, [FromServices] IMailService mail)
        {
            // Honeypot: لو حدا عبّى Website نعتبره بوت
            if (!string.IsNullOrWhiteSpace(m.Website))
            {
                TempData["Toast"] = "It was received.";
                TempData["ToastType"] = "ok";
                return RedirectToAction(nameof(Index));
            }

            if (!ModelState.IsValid)
            {
                TempData["Toast"] = "Check the fields and try again.";
                TempData["ToastType"] = "err";
                return RedirectToAction(nameof(Index));
            }

            try
            {
                var ok = await mail.SendContactAsync(m.Name, m.Email, m.Subject, m.Message);
                TempData["Toast"] = ok ? "Your message has been sent successfully. ✅" : "Failed to send, check your SMTP settings ❌";
                TempData["ToastType"] = ok ? "ok" : "err";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Contact send failed");
                TempData["Toast"] = "An unexpected error occurred while sending ❌";
                TempData["ToastType"] = "err";
            }

            return RedirectToAction(nameof(Index));
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
