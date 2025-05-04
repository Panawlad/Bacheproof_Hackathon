// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PotholeRegistry {
    struct Report {
        uint id;
        string location;
        string imageHash;
        address reporter;
        bool approved;
        uint cost;
        uint repairDate;
        bool paid;
        bool isFixed;
    }

    mapping(uint => Report) public reports;
    uint public nextReportId;
    address public owner;

    event ReportSubmitted(uint indexed id, string location, string imageHash, address indexed reporter);
    event ReportApproved(uint indexed id, uint cost, uint repairDate);
    event PaymentReceived(uint indexed id, address indexed payer, uint amount);
    event ReportFixed(uint indexed id);

    modifier onlyOwner() {
        require(msg.sender == owner, "Solo el propietario puede hacer esto");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function submitReport(string memory _location, string memory _imageHash) external {
        reports[nextReportId] = Report({
            id: nextReportId,
            location: _location,
            imageHash: _imageHash,
            reporter: msg.sender,
            approved: false,
            cost: 0,
            repairDate: 0,
            paid: false,
            isFixed: false
        });

        emit ReportSubmitted(nextReportId, _location, _imageHash, msg.sender);
        nextReportId++;
    }

    function approveReport(uint _id, uint _cost, uint _repairDate) external onlyOwner {
        require(_id < nextReportId, "Reporte no existe");
        Report storage rep = reports[_id];
        rep.approved = true;
        rep.cost = _cost;
        rep.repairDate = _repairDate;

        emit ReportApproved(_id, _cost, _repairDate);
    }

    function payForRepair(uint _id) external payable {
        require(_id < nextReportId, "Reporte no existe");
        Report storage rep = reports[_id];
        require(rep.approved, "Reporte no aprobado");
        require(!rep.paid, "Ya pagado");
        require(msg.value >= rep.cost, "Pago insuficiente");

        rep.paid = true;

        emit PaymentReceived(_id, msg.sender, msg.value);
    }

    function markAsFixed(uint _id) external onlyOwner {
        require(_id < nextReportId, "Reporte no existe");
        Report storage rep = reports[_id];
        require(rep.paid, "Aun no ha sido pagado");

        rep.isFixed = true;
        emit ReportFixed(_id);
    }

    function withdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}
