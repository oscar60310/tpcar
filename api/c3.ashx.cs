using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Net;
using System.Web;

namespace tpcar.api
{
    /// <summary>
    /// c3 的摘要描述
    /// </summary>
    public class c3 : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/plain";
            if ((context.Request.Params["key"] + "") != "ASSxpcE16CM")
            {
                context.Response.Write("404");
                return;
            }
            else
            {
                String url = System.Configuration.ConfigurationManager.AppSettings["connect2_url"];
                HttpWebRequest hwr = HttpWebRequest.Create(url) as HttpWebRequest;
                hwr.Method = "GET";
                HttpWebResponse resp = hwr.GetResponse() as HttpWebResponse;

                GZipStream gzs = new GZipStream(resp.GetResponseStream(), CompressionMode.Decompress);


                String result = "";
                StreamReader sr = new StreamReader(gzs);
                result = sr.ReadToEnd();
                sr.Close();
                resp.Close();

                String re = "";
                JObject data = JObject.Parse(result).GetValue("data") as JObject;
                JArray jo = data.GetValue("park") as JArray;
                re += data.GetValue("UPDATETIME") + "@";
                foreach (JObject park in jo)
                {
                    re += park.GetValue("id") + "," + park.GetValue("availablecar") + "," + park.GetValue("availablemotor") + "#";

                }


                context.Response.Write(re);
            }
        }

        public bool IsReusable
        {
            get
            {
                return false;
            }
        }
    }
}