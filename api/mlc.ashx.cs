
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Net;
using System.Web;

namespace tpcar.api
{
    /// <summary>
    /// mlc 的摘要描述
    /// </summary>
    public class mlc : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/plain";
            try
            {
                
                DateTime d = TimeZoneInfo.ConvertTime(DateTime.Now, TimeZoneInfo.FindSystemTimeZoneById("Taipei Standard Time"));
                CultureInfo culture = new CultureInfo("en-US");
                if (context.Request.Params["delay"] + "" != "")
                {
                    int delay = int.Parse(context.Request.Params["delay"] + "");
                    d = d.AddSeconds(delay);

                }

                string time = d.ToString("yyyy/MM/dd hh:mm:ss tt", culture);
                string values = "";
                if(context.Request.Params["ids"]+"" == "")
                {
                    context.Response.Write("{}");
                    return;
                }
                string[] ids = context.Request.Params["ids"].Split(',');
                
                for (int i = 0; i < ids.Length -1; i++)
                {
               //     ids[i] = Int32.Parse(ids[i]).ToString();
                    if(i==0)
                    {
                        values = "['" + ids[0] + "','" + time + "']";
                    }
                    else
                    {
                        values += ",['" + ids[i] + "','" + time + "']";
                    }
                }
                string data = "{'Inputs': {'input1': {'ColumnNames': ['id','time'],'Values': ["+values+"]}},'GlobalParameters': {}}";


                String url = System.Configuration.ConfigurationManager.AppSettings["ml_url"];
                HttpWebRequest hwr = HttpWebRequest.Create(url) as HttpWebRequest;
                hwr.Method = "POST";
                hwr.Headers["Authorization"] = System.Configuration.ConfigurationManager.AppSettings["ml_key"];
                hwr.ContentType = "application/json";
                byte[] datab = System.Text.Encoding.UTF8.GetBytes(data);
                hwr.ContentLength = datab.Length;
                hwr.GetRequestStream().Write(datab,0,datab.Length);
                

                HttpWebResponse resp = hwr.GetResponse() as HttpWebResponse;
                StreamReader sr = new StreamReader(resp.GetResponseStream());
                string result = sr.ReadToEnd();
                sr.Close();
                resp.Close();

                context.Response.Write(result);
            }
            catch (Exception e)
            {
                context.Response.Write(e + "");
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