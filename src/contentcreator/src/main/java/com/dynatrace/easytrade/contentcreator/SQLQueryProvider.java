package com.dynatrace.easytrade.contentcreator;

import com.dynatrace.easytrade.contentcreator.models.SQLTables;

public class SQLQueryProvider {
    public static class Queries {
        public static String selectFromTable(SQLTables table, String conditionString) {
            return "SELECT * FROM " + table.getName() + " " + conditionString;
        }

        public static String selectTopOldestAccounts(Integer count, String conditionString) {
            return "SELECT * FROM " + SQLTables.ACCOUNTS.getName()
                    + " " + conditionString + " ORDER BY CreationDate DESC LIMIT " + count;
        }

        public static String selectTopOldestAccounts(Integer count) {
            return selectTopOldestAccounts(count, Conditions.emptyCondition());
        }

        public static String updateAccountStatus(String selectQuery, boolean status) {
            // MySQL doesn't support CTEs in UPDATE the same way as SQL Server
            // Extract the table name and conditions from the select query
            return "UPDATE " + SQLTables.ACCOUNTS.getName() + " SET AccountActive=" + (status ? 1 : 0)
                    + " WHERE Id IN (" + selectQuery.replace("SELECT * FROM", "SELECT Id FROM") + ")";
        }

        public static String deleteSelected(String selectQuery) {
            // MySQL doesn't support CTEs in DELETE the same way as SQL Server
            return "DELETE FROM " + SQLTables.ACCOUNTS.getName()
                    + " WHERE Id IN (" + selectQuery.replace("SELECT * FROM", "SELECT Id FROM") + ")";
        }
    }

    public static class Conditions {
        public static String nonPresetActiveAccounts() {
            return "WHERE (AccountActive=1 AND Origin<>'PRESET')";
        }

        public static String nonPresetInactiveAccounts() {
            return "WHERE (AccountActive=0 AND Origin<>'PRESET')";
        }

        public static String emptyCondition() {
            return "";
        }
    }

}
