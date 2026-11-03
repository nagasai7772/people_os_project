// import { pool, query } from "./pool";
// import { hashPassword } from "../utils/password";

// async function seed() {
//   const adminHash = await hashPassword("Admin@123");
//   const managerHash = await hashPassword("Manager@123");
//   const employeeHash = await hashPassword("Employee@123");

//   const departments = [
//     ["Engineering","ENG","Software and platform engineering"],
//     ["Human Resources","HR","People operations"],
//     ["Product","PROD","Product strategy and delivery"],
//     ["Design","DES","Product and brand design"],
//     ["Finance","FIN","Finance and accounting"],
//     ["Marketing","MKT","Growth and marketing"]
//   ];
//   for (const [name,code,description] of departments) {
//     await query("INSERT INTO departments(name,code,description) VALUES($1,$2,$3) ON CONFLICT(code) DO NOTHING",[name,code,description]);
//   }
//   const dept = await query("SELECT id,code FROM departments");
//   const d = Object.fromEntries(dept.rows.map((x:any)=>[x.code,x.id]));
//   const designations = [
//     ["Chief Executive Officer","CEO",null,"EXECUTIVE"],["Engineering Manager","ENG-MGR","ENG","MANAGER"],
//     ["Senior Software Engineer","SSE","ENG","SENIOR"],["Software Engineer","SE","ENG","MID"],
//     ["HR Manager","HR-MGR","HR","MANAGER"],["HR Executive","HR-EXE","HR","JUNIOR"],
//     ["Product Manager","PM","PROD","MANAGER"],["UI/UX Designer","UX","DES","MID"],
//     ["Finance Analyst","FA","FIN","MID"],["Marketing Executive","ME","MKT","JUNIOR"]
//   ];
//   for (const [name,code,deptCode,level] of designations) {
//     await query("INSERT INTO designations(name,code,department_id,job_level) VALUES($1,$2,$3,$4) ON CONFLICT(code) DO NOTHING",[name,code,deptCode?d[deptCode]:null,level]);
//   }
//   const ds = await query("SELECT id,code FROM designations");
//   const designation = Object.fromEntries(ds.rows.map((x:any)=>[x.code,x.id]));
//   const employees = [
//     ["EMP001","Aarav","Mehta","aarav@peopleos.com","ENG","CEO",null],
//     ["EMP002","Diya","Sharma","diya@peopleos.com","ENG","ENG-MGR","EMP001"],
//     ["EMP003","Rohan","Verma","rohan@peopleos.com","ENG","SSE","EMP002"],
//     ["EMP004","Ananya","Reddy","ananya@peopleos.com","ENG","SE","EMP002"],
//     ["EMP005","Kabir","Patel","kabir@peopleos.com","HR","HR-MGR","EMP001"],
//     ["EMP006","Isha","Nair","isha@peopleos.com","HR","HR-EXE","EMP005"],
//     ["EMP007","Vivaan","Iyer","vivaan@peopleos.com","PROD","PM","EMP001"],
//     ["EMP008","Meera","Das","meera@peopleos.com","DES","UX","EMP007"],
//     ["EMP009","Arjun","Rao","arjun@peopleos.com","FIN","FA","EMP001"],
//     ["EMP010","Sara","Khan","sara@peopleos.com","MKT","ME","EMP001"]
//   ];
//   const employeeIds: Record<string,string> = {};
//   for (const e of employees) {
//     const r = await query(`INSERT INTO employees(employee_code,first_name,last_name,official_email,department_id,designation_id,joining_date)
//       VALUES($1,$2,$3,$4,$5,$6,CURRENT_DATE - INTERVAL '180 days')
//       ON CONFLICT(employee_code) DO UPDATE SET official_email=EXCLUDED.official_email RETURNING id,employee_code`,
//       // [e[0],e[1],e[2],e[3],d[e[4]],designation[e[5]]]);
//       [
//   e[0],
//   e[1],
//   e[2],
//   e[3],
//   d[e[4]],
//   designation[e[5]]
// ]
//     employeeIds[String(e[0])] = r.rows[0].id;
//   }
//   for (const e of employees) if (e[6]) await query("UPDATE employees SET manager_id=$1 WHERE employee_code=$2",[employeeIds[String(e[6])],e[0]]);
//   await query("UPDATE departments SET head_employee_id=$1 WHERE code='ENG'",[employeeIds.EMP002]);
//   await query("UPDATE departments SET head_employee_id=$1 WHERE code='HR'",[employeeIds.EMP005]);

//   const users = [
//     ["PeopleOS Admin","admin@peopleos.com",adminHash,"ADMIN",null],
//     ["Diya Sharma","manager@peopleos.com",managerHash,"MANAGER",employeeIds.EMP002],
//     ["Rohan Verma","employee@peopleos.com",employeeHash,"EMPLOYEE",employeeIds.EMP003]
//   ];
//   for (const u of users) await query("INSERT INTO users(name,email,password_hash,role,employee_id) VALUES($1,$2,$3,$4,$5) ON CONFLICT(email) DO NOTHING",u);
//   const admin = await query("SELECT id FROM users WHERE email='admin@peopleos.com'");
//   await query("INSERT INTO organization_settings(organization_name,company_email,industry,company_size) SELECT 'PeopleOS','hello@peopleos.com','Technology','11-50' WHERE NOT EXISTS(SELECT 1 FROM organization_settings)");
//   await query("INSERT INTO notifications(user_id,title,message,type) SELECT $1,'Welcome to PeopleOS','Your workspace is ready. Explore your employee directory.','INFO' WHERE NOT EXISTS(SELECT 1 FROM notifications WHERE user_id=$1)",[admin.rows[0].id]);
//   console.log("Seed completed. Demo logins: admin@peopleos.com / Admin@123; manager@peopleos.com / Manager@123; employee@peopleos.com / Employee@123");
// }
// seed().catch((e)=>{console.error(e);process.exitCode=1;}).finally(()=>pool.end());





import { pool, query } from "./pool";
import { hashPassword } from "../utils/password";

type DepartmentSeed = [
  name: string,
  code: string,
  description: string
];

type DesignationSeed = [
  name: string,
  code: string,
  departmentCode: string | null,
  level: string
];

type EmployeeSeed = [
  employeeCode: string,
  firstName: string,
  lastName: string,
  email: string,
  departmentCode: string,
  designationCode: string,
  managerCode: string | null
];

async function seed() {
  try {
    // Password hashes
    const adminHash = await hashPassword("Admin@123");
    const managerHash = await hashPassword("Manager@123");
    const employeeHash = await hashPassword("Employee@123");

    // 1. Departments
    const departments: DepartmentSeed[] = [
      ["Engineering", "ENG", "Software and platform engineering"],
      ["Human Resources", "HR", "People operations"],
      ["Product", "PROD", "Product strategy and delivery"],
      ["Design", "DES", "Product and brand design"],
      ["Finance", "FIN", "Finance and accounting"],
      ["Marketing", "MKT", "Growth and marketing"]
    ];

    for (const [name, code, description] of departments) {
      await query(
        `INSERT INTO departments(name, code, description)
         VALUES($1, $2, $3)
         ON CONFLICT(code) DO NOTHING`,
        [name, code, description]
      );
    }

    // Fetch department IDs
    const dept = await query(
      "SELECT id, code FROM departments"
    );

    const d: Record<string, string> = Object.fromEntries(
      dept.rows.map((x: any) => [x.code, x.id])
    );

    // 2. Designations
    const designations: DesignationSeed[] = [
      ["Chief Executive Officer", "CEO", null, "EXECUTIVE"],
      ["Engineering Manager", "ENG-MGR", "ENG", "MANAGER"],
      ["Senior Software Engineer", "SSE", "ENG", "SENIOR"],
      ["Software Engineer", "SE", "ENG", "MID"],
      ["HR Manager", "HR-MGR", "HR", "MANAGER"],
      ["HR Executive", "HR-EXE", "HR", "JUNIOR"],
      ["Product Manager", "PM", "PROD", "MANAGER"],
      ["UI/UX Designer", "UX", "DES", "MID"],
      ["Finance Analyst", "FA", "FIN", "MID"],
      ["Marketing Executive", "ME", "MKT", "JUNIOR"]
    ];

    for (const [name, code, deptCode, level] of designations) {
      const departmentId = deptCode ? d[deptCode] : null;

      if (deptCode && !departmentId) {
        throw new Error(`Department not found: ${deptCode}`);
      }

      await query(
        `INSERT INTO designations(
          name, code, department_id, job_level
        )
        VALUES($1, $2, $3, $4)
        ON CONFLICT(code) DO NOTHING`,
        [name, code, departmentId, level]
      );
    }

    // Fetch designation IDs
    const ds = await query(
      "SELECT id, code FROM designations"
    );

    const designation: Record<string, string> = Object.fromEntries(
      ds.rows.map((x: any) => [x.code, x.id])
    );

    // 3. Employees
    const employees: EmployeeSeed[] = [
      ["EMP001", "Aarav", "Mehta", "aarav@peopleos.com", "ENG", "CEO", null],
      ["EMP002", "Diya", "Sharma", "diya@peopleos.com", "ENG", "ENG-MGR", "EMP001"],
      ["EMP003", "Rohan", "Verma", "rohan@peopleos.com", "ENG", "SSE", "EMP002"],
      ["EMP004", "Ananya", "Reddy", "ananya@peopleos.com", "ENG", "SE", "EMP002"],
      ["EMP005", "Kabir", "Patel", "kabir@peopleos.com", "HR", "HR-MGR", "EMP001"],
      ["EMP006", "Isha", "Nair", "isha@peopleos.com", "HR", "HR-EXE", "EMP005"],
      ["EMP007", "Vivaan", "Iyer", "vivaan@peopleos.com", "PROD", "PM", "EMP001"],
      ["EMP008", "Meera", "Das", "meera@peopleos.com", "DES", "UX", "EMP007"],
      ["EMP009", "Arjun", "Rao", "arjun@peopleos.com", "FIN", "FA", "EMP001"],
      ["EMP010", "Sara", "Khan", "sara@peopleos.com", "MKT", "ME", "EMP001"]
    ];

    const employeeIds: Record<string, string> = {};

    for (const e of employees) {
      const departmentId = d[e[4]];
      const designationId = designation[e[5]];

      if (!departmentId) {
        throw new Error(`Department not found: ${e[4]}`);
      }

      if (!designationId) {
        throw new Error(`Designation not found: ${e[5]}`);
      }

      const r = await query(
        `INSERT INTO employees(
          employee_code,
          first_name,
          last_name,
          official_email,
          department_id,
          designation_id,
          joining_date
        )
        VALUES(
          $1, $2, $3, $4, $5, $6,
          CURRENT_DATE - INTERVAL '180 days'
        )
        ON CONFLICT(employee_code)
        DO UPDATE SET official_email = EXCLUDED.official_email
        RETURNING id, employee_code`,
        [
          e[0],
          e[1],
          e[2],
          e[3],
          departmentId,
          designationId
        ]
      );

      const insertedEmployee = r.rows[0];

      if (!insertedEmployee) {
        throw new Error(`Failed to seed employee: ${e[0]}`);
      }

      employeeIds[e[0]] = insertedEmployee.id;
    }

    // 4. Employee reporting managers
    for (const e of employees) {
      if (e[6]) {
        const managerId = employeeIds[e[6]];

        if (!managerId) {
          throw new Error(`Manager not found: ${e[6]}`);
        }

        await query(
          `UPDATE employees
           SET manager_id = $1
           WHERE employee_code = $2`,
          [managerId, e[0]]
        );
      }
    }

    // 5. Department heads
    await query(
      "UPDATE departments SET head_employee_id = $1 WHERE code = 'ENG'",
      [employeeIds.EMP002]
    );

    await query(
      "UPDATE departments SET head_employee_id = $1 WHERE code = 'HR'",
      [employeeIds.EMP005]
    );

    // 6. Users
    const users = [
      ["PeopleOS Admin", "admin@peopleos.com", adminHash, "ADMIN", null],
      ["Diya Sharma", "manager@peopleos.com", managerHash, "MANAGER", employeeIds.EMP002],
      ["Rohan Verma", "employee@peopleos.com", employeeHash, "EMPLOYEE", employeeIds.EMP003]
    ];

    for (const u of users) {
      await query(
        `INSERT INTO users(
          name, email, password_hash, role, employee_id
        )
        VALUES($1, $2, $3, $4, $5)
        ON CONFLICT(email) DO NOTHING`,
        u
      );
    }

    // 7. Admin user
    const admin = await query(
      "SELECT id FROM users WHERE email = 'admin@peopleos.com'"
    );

    if (!admin.rows[0]) {
      throw new Error("Admin user creation failed");
    }

    // 8. Organization settings
    await query(
      `INSERT INTO organization_settings(
        organization_name,
        company_email,
        industry,
        company_size
      )
      SELECT 'PeopleOS', 'hello@peopleos.com', 'Technology', '11-50'
      WHERE NOT EXISTS(
        SELECT 1 FROM organization_settings
      )`
    );

    // 9. Welcome notification
    await query(
      `INSERT INTO notifications(
        user_id, title, message, type
      )
      SELECT
        $1,
        'Welcome to PeopleOS',
        'Your workspace is ready. Explore your employee directory.',
        'INFO'
      WHERE NOT EXISTS(
        SELECT 1 FROM notifications WHERE user_id = $1
      )`,
      [admin.rows[0].id]
    );

    console.log("Seed completed successfully.");
    console.log("Demo logins:");
    console.log("Admin: admin@peopleos.com / Admin@123");
    console.log("Manager: manager@peopleos.com / Manager@123");
    console.log("Employee: employee@peopleos.com / Employee@123");

  } catch (error) {
    console.error("Database seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seed();
