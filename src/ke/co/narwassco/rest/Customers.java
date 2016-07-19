package ke.co.narwassco.rest;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response.Status;

import org.apache.log4j.Logger;

import ke.co.narwassco.common.ServletListener;

/**
 * <pre>
 *  クラス名  ：Customers
 *  クラス説明：
 * </pre>
 *
 * @version 1.00
 * @author Igarashi
 *
 */
@Path("/Customers")
public class Customers {
	private final Logger logger = Logger.getLogger(Customers.class);

	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public RestResult<ArrayList<HashMap<String,Object>>> get() throws SQLException {

		logger.info("get start.");
		Connection conn = null;
		try{
			Class.forName("org.postgresql.Driver");
			conn = DriverManager.getConnection(ServletListener.dburl, ServletListener.dbuser,ServletListener.dbpassword);
			StringBuffer sql = new StringBuffer("");
			sql.append("SELECT ");
			sql.append("  to_char(c.villageid,'00') as VillageID, ");
			sql.append("  v.name as VillageName,");
			sql.append("  c.zonecd as Zone, ");
			sql.append("  to_char(c.connno,'0000') as Con, ");
			sql.append("  c.name as Name,  ");
			sql.append("  c.status as Status,  ");
			sql.append("  ST_AsText(ST_Transform(m.geom,4326)) as WKT, ");
			sql.append("  c.serialno as SerialNo  ");
			sql.append("FROM  customer c ");
			sql.append("LEFT JOIN village v ");
			sql.append("ON c.villageid = v.villageid ");
			sql.append("LEFT JOIN meter m ");
			sql.append("ON c.zonecd = m.zonecd AND ");
			sql.append("   c.connno = m.connno ");
			sql.append("ORDER BY ");
			sql.append("   c.villageid, ");
			sql.append("   c.zonecd, ");
			sql.append("   c.connno ");

			PreparedStatement pstmt = conn.prepareStatement(sql.toString());
			ResultSet rs = pstmt.executeQuery();
			ResultSetMetaData rsmd= rs.getMetaData();
			ArrayList<HashMap<String,Object>> res = new ArrayList<HashMap<String,Object>>();
			while(rs.next()){
				HashMap<String,Object> data = new HashMap<String,Object>();
				for (int i = 1; i <= rsmd.getColumnCount(); i++) {
					String colname = rsmd.getColumnName(i);
					data.put(colname, rs.getObject(colname));
				}
				res.add(data);
			}

			return new RestResult<ArrayList<HashMap<String,Object>>>(res);
		}catch(Exception e){
			logger.error(e.getMessage(), e);
			throw new WebApplicationException(e, Status.INTERNAL_SERVER_ERROR);
		}finally{
			if (conn != null){
				conn.close();
				conn = null;
			}
		}
	}

}
