"use client";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function Page() {
  return (
    <div
      style={{
        height: "100vh",
        backgroundColor: "#ffffff",
        color: "#333333",
      }}
    >
      <SwaggerUI
        url="/swagger.json"
        docExpansion="list"
        deepLinking={true}
        displayOperationId={false}
        displayRequestDuration={true}
      />
    </div>
  );
}
