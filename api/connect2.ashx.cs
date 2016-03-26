using System;
using System.Collections.Generic;
using System.Web;
using System.Net;
using System.IO;
using Newtonsoft.Json.Linq;
using System.IO.Compression;

namespace tpcar.api
{
    /// <summary>
    /// connect2 的摘要描述
    /// </summary>
    public class connect2 : IHttpHandler
    {
        class statu
        {
            public string id;
            public string moto;
            public string car;
        }
        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/plain";
            List<statu> ids = new List<statu>();
            try
            {
                String []s = (context.Request.Params["ids"]+"").Split(',');
                foreach (String so in s)
                {
                    statu ns = new statu();
                    ns.id = so;
                    ns.moto = "-9";
                    ns.car = "-9";
                    ids.Add(ns);
                }
            }
            catch
            {
                context.Response.Write("Error");
                return;
            }
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
            JObject data = JObject.Parse(result).GetValue("data") as JObject;
            JArray jo = data.GetValue("park") as JArray;
            for(int i = 0; i<ids.Count;i++)
            {
                foreach (JObject park in jo)
                {
                    if(park.GetValue("id")+"" == ids[i].id )
                    {
                        ids[i].car = park.GetValue("availablecar") + "";
                        ids[i].moto = park.GetValue("availablemotor")+"";
                        break;
                    }
                }
                context.Response.Write(ids[i].car + "@" + ids[i].moto + "#");
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