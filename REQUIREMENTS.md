# Ikimina Pay: Requirements

## 1. What is Ikimina Pay?
Ikimina Pay is a website for savings groups. Members pay their contributions with mobile money, and the group can see who has paid, who has not, and how much has been collected.

Example: 10 people agree to pay 5,000 RWF every month. Each month, every member pays from their phone, and the treasurer sees the results on one page instead of checking a notebook.

## 2. Who uses it?
- **Group Admin:** creates a group and adds the members.
- **Treasurer:** sets how much to pay and by when, and checks who has paid.
- **Member:** sees what they owe and pays.

One person can have a different role in each group. For example, they can be the admin of one group and a member of another.

## 3. What can each person do?
| Action | Admin | Treasurer | Member |
| --- | --- | --- | --- |
| Create a group | Yes | n/a | n/a |
| Add or remove members | Yes | No | No |
| Choose the treasurer | Yes | No | No |
| Create a contribution (amount and due date) | Yes | Yes | No |
| See everyone's payments in the group | Yes | Yes | No |
| See their own payments | Yes | Yes | Yes |
| Pay their own contribution | Yes | Yes | Yes |

Anyone who registers can create a group. They become that group's admin.

## 4. Main features
1. **Register and log in.**
2. **Groups:** create a group, add members, choose a treasurer.
3. **Contributions:** set an amount and a due date. Every member then owes that amount.
4. **Payments:** a member pays with MTN MoMo or Airtel Money.
5. **Tracking:** the admin and treasurer see who has paid, who is waiting and who is late, plus the total collected.
6. **Messages:** after a payment succeeds, the member gets an email receipt and an SMS.

## 5. How a payment works
1. The member picks a contribution and chooses MTN MoMo or Airtel Money.
2. The member enters their phone number.
3. The member gets a prompt on their phone and confirms it with their PIN.
4. The payment company tells our app the result.
5. Only then does the app mark the contribution as paid.

For the first version, payments run in the providers' test (sandbox) mode. No real money moves.

## 6. Rules
- A member can only pay their own contributions.
- A payment counts only after the payment company confirms it.
- If the payment company sends the same message twice, the payment still counts once.
- Nobody can mark a payment as paid by hand.
- People can only see information about groups they belong to.

## 7. Done when this works on the live website
- [ ] I can register, log in and create a group.
- [ ] I can add two members and choose one as treasurer.
- [ ] The treasurer can create a contribution, and each member sees it.
- [ ] A member can pay with MTN MoMo (test mode).
- [ ] A member can pay with Airtel Money (test mode).
- [ ] A contribution becomes paid only after the payment company confirms it.
- [ ] A repeated confirmation does not count the payment twice.
- [ ] The member gets an email receipt and an SMS.
- [ ] The treasurer sees who has paid, who is waiting and who is late.
- [ ] Someone outside the group cannot see the group's information.

## 8. Not in the first version
- Bank cards
- Cash payments and refunds
- Automatic payment reminders
- Mobile app
- Chat and advanced reports
- Approval before creating a group