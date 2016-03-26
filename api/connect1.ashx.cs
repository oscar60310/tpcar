using System;
using System.Collections.Generic;
using System.Web;
using System.Net;
using System.IO;
using Newtonsoft.Json.Linq;
using System.IO.Compression;

namespace tpcar.api
{

    public class connect1 : IHttpHandler
    {
        double user_lon, user_lat;
        double field_lon, field_lat;
        struct car_field
        {
            public double lat;
            public double lon;
            public int num;
            public double distance;
        }
        public void ProcessRequest(HttpContext context)
        {
           
            try
            {
                user_lon = Double.Parse(context.Request.QueryString["lon"]);
                user_lat = Double.Parse(context.Request.QueryString["lat"]);
            }
            catch
            {
                context.Response.Write("Error");
                return;
            }
            context.Response.ContentType = "text/plain";
            String url = System.Configuration.ConfigurationManager.AppSettings["connect1_url"];
            HttpWebRequest hwr = HttpWebRequest.Create(url) as HttpWebRequest;
            hwr.Method = "GET";
            HttpWebResponse resp = hwr.GetResponse() as HttpWebResponse;

            GZipStream gzs = new GZipStream(resp.GetResponseStream(), CompressionMode.Decompress);
           
            
            String result = "";
            StreamReader sr = new StreamReader(gzs);
            result = sr.ReadToEnd();
            sr.Close();
            resp.Close();
            //context.Response.Write(result);
          
            JObject data = JObject.Parse(result).GetValue("data") as JObject;


            JArray jo = data.GetValue("park") as JArray;
            List<car_field> fields = new List<car_field>();
            int num_c = 0;
            foreach(JObject field in jo)
            {
                double x, y;
                x = double.Parse(field.GetValue("tw97x")+"");
                y = double.Parse(field.GetValue("tw97y") + "");
                Cal_TWD97_To_lonlat(x, y);
               
                car_field cf = new car_field();
                cf.num = num_c;
                num_c++;
                cf.lat = field_lat;
                cf.lon = field_lon;
                cf.distance = ((user_lon - field_lon) * (user_lon - field_lon)) + ((user_lat - field_lat) * (user_lat - field_lat));

                fields.Add(cf);
               
            }

            //挑最近的10個回傳
            for (int i = 0; i < 10; i++)
            {
                if (fields.Count > 0)
                {
                    int choose = 0;
                    double min = fields[0].distance;
                    for (int j = 1; j < fields.Count; j++)
                    {
                        if (fields[j].distance < min)
                        {
                            min = fields[j].distance;
                            choose = j;
                        }
                    }

                    JObject obj = jo[fields[choose].num] as JObject;
                    context.Response.Write(obj.GetValue("name")+ "@" + fields[choose].lat
                        + "@" + fields[choose].lon +"@" + obj.GetValue("totalcar") 
                        + "@" + obj.GetValue("totalmotor") + "@" + obj.GetValue("address") +
                        "@" + obj.GetValue("payex") + "@" + obj.GetValue("type") + "@" + obj.GetValue("id")+  "#");
                    fields.Remove(fields[choose]);

                }
            }
            

            
        }

        public bool IsReusable
        {
            get
            {
                return false;
            }
        }

        private string Cal_TWD97_To_lonlat(double x, double y)
        {
            double a = 6378137.0;
            double b = 6356752.314245;
            double lon0 = 121 * Math.PI / 180;
            double k0 = 0.9999;
            int dx = 250000;

            double dy = 0;
            double e = Math.Pow((1 - Math.Pow(b, 2) / Math.Pow(a, 2)), 0.5);

            x -= dx;
            y -= dy;

            // Calculate the Meridional Arc
            double M = y / k0;

            // Calculate Footprint Latitude
            double mu = M / (a * (1.0 - Math.Pow(e, 2) / 4.0 - 3 * Math.Pow(e, 4) / 64.0 - 5 * Math.Pow(e, 6) / 256.0));
            double e1 = (1.0 - Math.Pow((1.0 - Math.Pow(e, 2)), 0.5)) / (1.0 + Math.Pow((1.0 - Math.Pow(e, 2)), 0.5));

            double J1 = (3 * e1 / 2 - 27 * Math.Pow(e1, 3) / 32.0);
            double J2 = (21 * Math.Pow(e1, 2) / 16 - 55 * Math.Pow(e1, 4) / 32.0);
            double J3 = (151 * Math.Pow(e1, 3) / 96.0);
            double J4 = (1097 * Math.Pow(e1, 4) / 512.0);

            double fp = mu + J1 * Math.Sin(2 * mu) + J2 * Math.Sin(4 * mu) + J3 * Math.Sin(6 * mu) + J4 * Math.Sin(8 * mu);

            // Calculate Latitude and Longitude

            double e2 = Math.Pow((e * a / b), 2);
            double C1 = Math.Pow(e2 * Math.Cos(fp), 2);
            double T1 = Math.Pow(Math.Tan(fp), 2);
            double R1 = a * (1 - Math.Pow(e, 2)) / Math.Pow((1 - Math.Pow(e, 2) * Math.Pow(Math.Sin(fp), 2)), (3.0 / 2.0));
            double N1 = a / Math.Pow((1 - Math.Pow(e, 2) * Math.Pow(Math.Sin(fp), 2)), 0.5);

            double D = x / (N1 * k0);

            // 計算緯度
            double Q1 = N1 * Math.Tan(fp) / R1;
            double Q2 = (Math.Pow(D, 2) / 2.0);
            double Q3 = (5 + 3 * T1 + 10 * C1 - 4 * Math.Pow(C1, 2) - 9 * e2) * Math.Pow(D, 4) / 24.0;
            double Q4 = (61 + 90 * T1 + 298 * C1 + 45 * Math.Pow(T1, 2) - 3 * Math.Pow(C1, 2) - 252 * e2) * Math.Pow(D, 6) / 720.0;
            double lat = fp - Q1 * (Q2 - Q3 + Q4);

            // 計算經度
            double Q5 = D;
            double Q6 = (1 + 2 * T1 + C1) * Math.Pow(D, 3) / 6;
            double Q7 = (5 - 2 * C1 + 28 * T1 - 3 * Math.Pow(C1, 2) + 8 * e2 + 24 * Math.Pow(T1, 2)) * Math.Pow(D, 5) / 120.0;
            double lon = lon0 + (Q5 - Q6 + Q7) / Math.Cos(fp);

            lat = (lat * 180) / Math.PI; //緯
            lon = (lon * 180) / Math.PI; //經

            field_lon = lon;
            field_lat = lat;
            string lonlat = lon + "," + lat;
            return lonlat;
        }
    }
}